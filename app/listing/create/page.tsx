"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

const STEP_LABELS = [
  "Space Details",
  "Items",
  "Availability",
  "Photos",
  "Review",
] as const;

const AREAS = [
  "South Street",
  "North Street",
  "Market Street",
  "North Haugh",
  "City Road",
  "St Mary's Place",
  "Howard Place",
  "The Scores",
  "Abbey Street",
  "Other",
];

export interface ListingFormData {
  title: string;
  area: string;
  floorLevel: string;
  accessNotes: string;
  description: string;
  acceptsSmallBulky: boolean;
  acceptsLargeBulky: boolean;
  acceptsBikes: boolean;
  capacity: number | "";
  rules: string;
  dropOffStart: string;
  dropOffEnd: string;
  collectionStart: string;
  collectionEnd: string;
  photoUrls: string[];
}

const INITIAL_FORM_DATA: ListingFormData = {
  title: "",
  area: "",
  floorLevel: "",
  accessNotes: "",
  description: "",
  acceptsSmallBulky: false,
  acceptsLargeBulky: false,
  acceptsBikes: false,
  capacity: "",
  rules: "",
  dropOffStart: "",
  dropOffEnd: "",
  collectionStart: "",
  collectionEnd: "",
  photoUrls: [],
};

const STORAGE_KEY = "space4it-listing-draft";

function loadDraft(): ListingFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ListingFormData;
  } catch {
    return null;
  }
}

function saveDraft(data: ListingFormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─── Validation helpers ──────────────────────────────────────────────

function validateStep1(data: ListingFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.title.trim()) errors.title = "Title is required";
  else if (data.title.length > 100) errors.title = "Title must be 100 characters or fewer";
  if (!data.area) errors.area = "Please select an area";
  if (data.description.length > 500) errors.description = "Description must be 500 characters or fewer";
  return errors;
}

function validateStep2(data: ListingFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.capacity === "" || data.capacity < 1)
    errors.capacity = "Capacity is required (1-30)";
  else if (data.capacity > 30) errors.capacity = "Maximum capacity is 30";
  return errors;
}

function validateStep3(data: ListingFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.dropOffStart) errors.dropOffStart = "Drop-off start date is required";
  if (!data.dropOffEnd) errors.dropOffEnd = "Drop-off end date is required";
  if (!data.collectionStart) errors.collectionStart = "Collection start date is required";
  if (!data.collectionEnd) errors.collectionEnd = "Collection end date is required";

  if (data.dropOffStart && data.dropOffEnd && data.dropOffEnd <= data.dropOffStart)
    errors.dropOffEnd = "Must be after drop-off start";
  if (data.dropOffEnd && data.collectionStart && data.collectionStart <= data.dropOffEnd)
    errors.collectionStart = "Must be after drop-off window ends";
  if (data.collectionStart && data.collectionEnd && data.collectionEnd <= data.collectionStart)
    errors.collectionEnd = "Must be after collection start";

  return errors;
}

// ─── Step Indicator ──────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <div className="mb-8">
      <div className="hidden sm:flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = completedSteps.has(stepNum);
          const isCurrent = currentStep === stepNum;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-accent text-white"
                      : "bg-primary/10 text-primary/40"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? "text-accent" : isCompleted ? "text-green-600" : "text-primary/40"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    isCompleted ? "bg-green-500" : "bg-primary/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-accent">
            Step {currentStep} of {STEP_LABELS.length}
          </span>
          <span className="text-sm font-medium text-primary/60">
            {STEP_LABELS[currentStep - 1]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEP_LABELS.map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = completedSteps.has(stepNum);
            const isCurrent = currentStep === stepNum;
            return (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                    ? "bg-accent"
                    : "bg-primary/10"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Shared UI helpers ───────────────────────────────────────────────

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-primary mb-1.5">
      {children}
      {required && <span className="text-action ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-action">{message}</p>;
}

const inputClasses =
  "w-full rounded-lg border border-primary/10 bg-white px-4 py-2.5 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

function StepNavButtons({
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          Back
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-lg bg-action px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-action/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

// ─── Step 1 — Space Details ──────────────────────────────────────────

function Step1SpaceDetails({
  formData,
  onChange,
  onNext,
}: {
  formData: ListingFormData;
  onChange: <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleNext = () => {
    const errs = validateStep1(formData);
    setErrors(errs);
    setTouched(new Set(Object.keys(errs)));
    if (Object.keys(errs).length === 0) onNext();
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    const errs = validateStep1(formData);
    setErrors(errs);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-primary">Space Details</h2>
      <p className="mt-1 text-sm text-primary/60">Tell us about your storage space.</p>

      <div className="mt-6 space-y-5">
        <div>
          <FieldLabel htmlFor="title" required>Title</FieldLabel>
          <input
            id="title"
            type="text"
            maxLength={100}
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            placeholder="e.g. Spare room on North Street"
            className={inputClasses}
          />
          <div className="mt-1 flex justify-between">
            <FieldError message={touched.has("title") ? errors.title : undefined} />
            <span className="text-xs text-primary/40">{formData.title.length}/100</span>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="area" required>Area</FieldLabel>
          <select
            id="area"
            value={formData.area}
            onChange={(e) => onChange("area", e.target.value)}
            onBlur={() => handleBlur("area")}
            className={inputClasses}
          >
            <option value="">Select an area...</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <FieldError message={touched.has("area") ? errors.area : undefined} />
        </div>

        <div>
          <FieldLabel htmlFor="floorLevel">Floor Level</FieldLabel>
          <input
            id="floorLevel"
            type="text"
            value={formData.floorLevel}
            onChange={(e) => onChange("floorLevel", e.target.value)}
            placeholder="e.g. Ground floor, 1st floor"
            className={inputClasses}
          />
        </div>

        <div>
          <FieldLabel htmlFor="accessNotes">Access Notes</FieldLabel>
          <textarea
            id="accessNotes"
            rows={2}
            value={formData.accessNotes}
            onChange={(e) => onChange("accessNotes", e.target.value)}
            placeholder="e.g. Side entrance, no stairs"
            className={inputClasses + " resize-none"}
          />
        </div>

        <div>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <textarea
            id="description"
            rows={4}
            maxLength={500}
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            placeholder="Describe your space — size, conditions, any restrictions..."
            className={inputClasses + " resize-none"}
          />
          <div className="mt-1 flex justify-between">
            <FieldError message={touched.has("description") ? errors.description : undefined} />
            <span className="text-xs text-primary/40">{formData.description.length}/500</span>
          </div>
        </div>
      </div>

      <StepNavButtons onNext={handleNext} />
    </div>
  );
}

// ─── Step 2 — What You Can Store ─────────────────────────────────────

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/10 p-4">
      <div>
        <span className="text-sm font-semibold text-primary">{label}</span>
        {description && <p className="text-xs text-primary/50 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-primary/20"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );
}

function Step2Items({
  formData,
  onChange,
  onNext,
  onBack,
}: {
  formData: ListingFormData;
  onChange: <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const errs = validateStep2(formData);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-primary">What You Can Store</h2>
      <p className="mt-1 text-sm text-primary/60">Select the item types your space can accommodate.</p>

      <div className="mt-6 space-y-3">
        <ToggleSwitch
          label="Standard Boxes"
          description="Always accepted"
          checked={true}
          onChange={() => {}}
          disabled
        />
        <ToggleSwitch
          label="Small Bulky Items"
          description="Suitcases, duffel bags, small furniture"
          checked={formData.acceptsSmallBulky}
          onChange={(v) => onChange("acceptsSmallBulky", v)}
        />
        <ToggleSwitch
          label="Large Bulky Items"
          description="Mattresses, large furniture"
          checked={formData.acceptsLargeBulky}
          onChange={(v) => onChange("acceptsLargeBulky", v)}
        />
        <ToggleSwitch
          label="Bikes"
          description="Bicycles"
          checked={formData.acceptsBikes}
          onChange={(v) => onChange("acceptsBikes", v)}
        />
      </div>

      <div className="mt-6">
        <FieldLabel htmlFor="capacity" required>Maximum Capacity (items)</FieldLabel>
        <input
          id="capacity"
          type="number"
          min={1}
          max={30}
          value={formData.capacity}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : Number(e.target.value);
            onChange("capacity", val as ListingFormData["capacity"]);
          }}
          placeholder="e.g. 10"
          className={inputClasses + " max-w-[140px]"}
        />
        <FieldError message={errors.capacity} />
      </div>

      <div className="mt-5">
        <FieldLabel htmlFor="rules">House Rules</FieldLabel>
        <textarea
          id="rules"
          rows={3}
          value={formData.rules}
          onChange={(e) => onChange("rules", e.target.value)}
          placeholder="e.g. No food, no liquids, no hazardous materials"
          className={inputClasses + " resize-none"}
        />
      </div>

      <StepNavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}

// ─── Step 3 — Availability ───────────────────────────────────────────

function Step3Availability({
  formData,
  onChange,
  onNext,
  onBack,
}: {
  formData: ListingFormData;
  onChange: <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const errs = validateStep3(formData);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-primary">Availability</h2>
      <p className="mt-1 text-sm text-primary/60">Set when students can drop off and collect their items.</p>

      <div className="mt-6 space-y-6">
        <div className="rounded-lg border border-primary/10 p-4">
          <h3 className="text-sm font-bold text-primary mb-4">Drop-off Window</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="dropOffStart" required>Start Date</FieldLabel>
              <input
                id="dropOffStart"
                type="date"
                value={formData.dropOffStart}
                onChange={(e) => onChange("dropOffStart", e.target.value)}
                className={inputClasses}
              />
              <FieldError message={errors.dropOffStart} />
            </div>
            <div>
              <FieldLabel htmlFor="dropOffEnd" required>End Date</FieldLabel>
              <input
                id="dropOffEnd"
                type="date"
                value={formData.dropOffEnd}
                min={formData.dropOffStart || undefined}
                onChange={(e) => onChange("dropOffEnd", e.target.value)}
                className={inputClasses}
              />
              <FieldError message={errors.dropOffEnd} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-primary/10 p-4">
          <h3 className="text-sm font-bold text-primary mb-4">Collection Window</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="collectionStart" required>Start Date</FieldLabel>
              <input
                id="collectionStart"
                type="date"
                value={formData.collectionStart}
                min={formData.dropOffEnd || undefined}
                onChange={(e) => onChange("collectionStart", e.target.value)}
                className={inputClasses}
              />
              <FieldError message={errors.collectionStart} />
            </div>
            <div>
              <FieldLabel htmlFor="collectionEnd" required>End Date</FieldLabel>
              <input
                id="collectionEnd"
                type="date"
                value={formData.collectionEnd}
                min={formData.collectionStart || undefined}
                onChange={(e) => onChange("collectionEnd", e.target.value)}
                className={inputClasses}
              />
              <FieldError message={errors.collectionEnd} />
            </div>
          </div>
        </div>
      </div>

      <StepNavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}

// ─── Step 4 — Photos ─────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PHOTOS = 6;

interface UploadingPhoto {
  id: string;
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

function Step4Photos({
  formData,
  onChange,
  onNext,
  onBack,
}: {
  formData: ListingFormData;
  onChange: <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [bucketError, setBucketError] = useState(false);

  const totalPhotos = formData.photoUrls.length + uploading.filter((u) => !u.error && !u.url).length;
  const canAddMore = totalPhotos < MAX_PHOTOS;

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploading((prev) => [...prev, { id, file, progress: 0, error: "Unsupported file type (jpg, png, webp only)" }]);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploading((prev) => [...prev, { id, file, progress: 0, error: "File exceeds 5 MB limit" }]);
        return;
      }

      setUploading((prev) => [...prev, { id, file, progress: 10 }]);

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      setUploading((prev) =>
        prev.map((u) => (u.id === id ? { ...u, progress: 40 } : u))
      );

      const { error } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (error) {
        const isBucketMissing =
          error.message?.toLowerCase().includes("bucket") ||
          error.message?.toLowerCase().includes("not found") ||
          error.message?.toLowerCase().includes("violates");
        if (isBucketMissing) setBucketError(true);
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress: 0, error: error.message } : u))
        );
        return;
      }

      setUploading((prev) =>
        prev.map((u) => (u.id === id ? { ...u, progress: 80 } : u))
      );

      const { data: urlData } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      setUploading((prev) =>
        prev.map((u) => (u.id === id ? { ...u, progress: 100, url: publicUrl } : u))
      );

      onChange("photoUrls", [...formData.photoUrls, publicUrl]);

      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== id));
      }, 600);
    },
    [supabase, formData.photoUrls, onChange]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const remaining = MAX_PHOTOS - totalPhotos;
      const batch = fileArr.slice(0, remaining);
      batch.forEach((f) => uploadFile(f));
    },
    [totalPhotos, uploadFile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (url: string) => {
    onChange(
      "photoUrls",
      formData.photoUrls.filter((u) => u !== url)
    );
  };

  const removeUploadingError = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-primary">Photos</h2>
      <p className="mt-1 text-sm text-primary/60">
        Add up to {MAX_PHOTOS} photos of your storage space.
      </p>

      {bucketError && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Storage not configured</p>
          <p className="mt-1 text-xs text-amber-700">
            The Supabase Storage bucket &quot;listing-photos&quot; is not set up yet. You can skip
            this step and add photos later.
          </p>
        </div>
      )}

      {/* Thumbnails grid */}
      {(formData.photoUrls.length > 0 || uploading.length > 0) && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {formData.photoUrls.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-primary/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Listing photo" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {uploading.map((u) => (
            <div key={u.id} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-primary/10 bg-primary/5">
              {u.error ? (
                <div className="p-2 text-center">
                  <p className="text-xs text-action font-medium truncate max-w-full">{u.error}</p>
                  <button
                    type="button"
                    onClick={() => removeUploadingError(u.id)}
                    className="mt-1 text-xs text-primary/50 underline"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className="w-full px-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-center text-xs text-primary/50">{u.progress}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragActive
              ? "border-accent bg-accent/5"
              : "border-primary/15 hover:border-accent/50 hover:bg-primary/[0.02]"
          }`}
        >
          <svg className="h-8 w-8 text-primary/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.412 4.095A4.5 4.5 0 0118 19.5H6.75z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-primary/60">
            Drag & drop photos here, or <span className="text-accent font-semibold">click to browse</span>
          </p>
          <p className="mt-1 text-xs text-primary/40">
            JPG, PNG, WebP — max 5 MB each — {MAX_PHOTOS - formData.photoUrls.length} remaining
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <StepNavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={formData.photoUrls.length === 0 ? "Skip for Now" : "Next"}
      />
    </div>
  );
}

// ─── Step 5 — Review & Publish ───────────────────────────────────────

function ReviewSection({
  title,
  stepNumber,
  onEdit,
  children,
}: {
  title: string;
  stepNumber: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-primary/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepNumber)}
          className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
      {children}
    </span>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Step5Review({
  formData,
  onBack,
  goToStep,
  onSubmit,
  submitting,
  submitError,
}: {
  formData: ListingFormData;
  onBack: () => void;
  goToStep: (step: number) => void;
  onSubmit: (status: "active" | "draft") => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const itemBadges: string[] = ["Standard Boxes"];
  if (formData.acceptsSmallBulky) itemBadges.push("Small Bulky");
  if (formData.acceptsLargeBulky) itemBadges.push("Large Bulky");
  if (formData.acceptsBikes) itemBadges.push("Bikes");

  return (
    <div>
      <h2 className="text-xl font-bold text-primary">Review & Publish</h2>
      <p className="mt-1 text-sm text-primary/60">Check everything looks right before publishing.</p>

      <div className="mt-6 space-y-4">
        {/* Space details */}
        <ReviewSection title="Space Details" stepNumber={1} onEdit={goToStep}>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-primary/50">Title</dt>
              <dd className="font-medium text-primary">{formData.title || "—"}</dd>
            </div>
            <div>
              <dt className="text-primary/50">Area</dt>
              <dd className="font-medium text-primary">{formData.area || "—"}</dd>
            </div>
            {formData.floorLevel && (
              <div>
                <dt className="text-primary/50">Floor Level</dt>
                <dd className="font-medium text-primary">{formData.floorLevel}</dd>
              </div>
            )}
            {formData.accessNotes && (
              <div>
                <dt className="text-primary/50">Access Notes</dt>
                <dd className="font-medium text-primary">{formData.accessNotes}</dd>
              </div>
            )}
            {formData.description && (
              <div>
                <dt className="text-primary/50">Description</dt>
                <dd className="font-medium text-primary">{formData.description}</dd>
              </div>
            )}
          </dl>
        </ReviewSection>

        {/* Items */}
        <ReviewSection title="What You Can Store" stepNumber={2} onEdit={goToStep}>
          <div className="flex flex-wrap gap-2 mb-3">
            {itemBadges.map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-primary/50">Maximum Capacity</dt>
              <dd className="font-medium text-primary">{formData.capacity || "—"} items</dd>
            </div>
            {formData.rules && (
              <div>
                <dt className="text-primary/50">House Rules</dt>
                <dd className="font-medium text-primary">{formData.rules}</dd>
              </div>
            )}
          </dl>
        </ReviewSection>

        {/* Availability */}
        <ReviewSection title="Availability" stepNumber={3} onEdit={goToStep}>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-primary/50">Drop-off Window</dt>
              <dd className="font-medium text-primary">
                {formatDate(formData.dropOffStart)} – {formatDate(formData.dropOffEnd)}
              </dd>
            </div>
            <div>
              <dt className="text-primary/50">Collection Window</dt>
              <dd className="font-medium text-primary">
                {formatDate(formData.collectionStart)} – {formatDate(formData.collectionEnd)}
              </dd>
            </div>
          </dl>
        </ReviewSection>

        {/* Photos */}
        <ReviewSection title="Photos" stepNumber={4} onEdit={goToStep}>
          {formData.photoUrls.length === 0 ? (
            <p className="text-sm text-primary/50">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {formData.photoUrls.map((url) => (
                <div key={url} className="aspect-square overflow-hidden rounded-lg border border-primary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Listing photo" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </ReviewSection>
      </div>

      {submitError && (
        <div className="mt-4 rounded-lg border border-action/30 bg-action/5 p-3">
          <p className="text-sm text-action">{submitError}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-lg bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onSubmit("draft")}
            disabled={submitting}
            className="rounded-lg border border-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => onSubmit("active")}
            disabled={submitting}
            className="rounded-lg bg-action px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-action/90 disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function CreateListingPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [authChecked, setAuthChecked] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_FORM_DATA);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
    }
    setDraftRestored(true);
  }, []);

  // Persist to localStorage on every form change (after initial restore)
  useEffect(() => {
    if (draftRestored) {
      saveDraft(formData);
    }
  }, [formData, draftRestored]);

  // Role-based access: check if user is a host
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    async function checkHostRole() {
      const { data } = await supabase
        .from("users")
        .select("role_host")
        .eq("id", user!.id)
        .single();

      if (data?.role_host) {
        setIsHost(true);
      } else {
        router.replace("/dashboard/storer");
        return;
      }
      setAuthChecked(true);
    }

    checkHostRole();
  }, [user, authLoading, supabase, router]);

  const updateFormData = useCallback(
    <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  }, []);

  const goNext = useCallback(() => {
    markStepCompleted(currentStep);
    setCurrentStep((s) => Math.min(s + 1, 5));
  }, [currentStep, markStepCompleted]);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(
    async (status: "active" | "draft") => {
      if (!user) {
        setSubmitError("You must be signed in to create a listing.");
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      const itemCategories: string[] = ["boxes"];
      if (formData.acceptsSmallBulky) itemCategories.push("small_bulky");
      if (formData.acceptsLargeBulky) itemCategories.push("large_bulky");
      if (formData.acceptsBikes) itemCategories.push("bikes");

      const { error } = await supabase.from("listings").insert({
        host_id: user.id,
        title: formData.title,
        area: formData.area,
        item_categories: itemCategories,
        capacity: Number(formData.capacity) || 1,
        rules: formData.rules || null,
        photos: formData.photoUrls,
        availability_start: formData.dropOffStart,
        availability_end: formData.collectionEnd,
        accepts_bikes: formData.acceptsBikes,
        accepts_bulky: formData.acceptsSmallBulky || formData.acceptsLargeBulky,
        status,
      });

      setSubmitting(false);

      if (error) {
        setSubmitError(error.message || "Something went wrong. Please try again.");
        return;
      }

      clearDraft();
      router.push("/dashboard/host");
    },
    [user, supabase, formData, router]
  );

  // Show loading spinner while checking auth
  if (authLoading || !authChecked || !isHost) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-accent" />
          <p className="text-sm text-primary/50">Checking access...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          {currentStep === 1 && (
            <Step1SpaceDetails formData={formData} onChange={updateFormData} onNext={goNext} />
          )}
          {currentStep === 2 && (
            <Step2Items formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 3 && (
            <Step3Availability formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 4 && (
            <Step4Photos formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 5 && (
            <Step5Review
              formData={formData}
              onBack={goBack}
              goToStep={goToStep}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </div>
      </div>
    </main>
  );
}
