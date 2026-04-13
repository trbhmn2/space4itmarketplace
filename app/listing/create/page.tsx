"use client";

import { useState, useCallback } from "react";

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

// ─── Main Page ───────────────────────────────────────────────────────

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_FORM_DATA);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
            <StepPlaceholder title="Photos" onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 5 && (
            <StepPlaceholder title="Review & Publish" onBack={goBack} />
          )}
        </div>
      </div>
    </main>
  );
}

function StepPlaceholder({
  title,
  onNext,
  onBack,
}: {
  title: string;
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-primary/60">This step will be implemented next.</p>
      <StepNavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}
