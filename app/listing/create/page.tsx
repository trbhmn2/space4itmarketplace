"use client";

import { useState, useCallback } from "react";

const STEP_LABELS = [
  "Space Details",
  "Items",
  "Availability",
  "Photos",
  "Review",
] as const;

interface FormData {
  // Step 1
  title: string;
  area: string;
  floorLevel: string;
  accessNotes: string;
  description: string;
  // Step 2
  acceptsSmallBulky: boolean;
  acceptsLargeBulky: boolean;
  acceptsBikes: boolean;
  capacity: number | "";
  rules: string;
  // Step 3
  dropOffStart: string;
  dropOffEnd: string;
  collectionStart: string;
  collectionEnd: string;
  // Step 4
  photoUrls: string[];
}

const INITIAL_FORM_DATA: FormData = {
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

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <div className="mb-8">
      {/* Desktop step indicator */}
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
      {/* Mobile step indicator */}
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

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateFormData = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
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

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          {currentStep === 1 && (
            <StepPlaceholder
              title="Space Details"
              onNext={goNext}
            />
          )}
          {currentStep === 2 && (
            <StepPlaceholder
              title="What You Can Store"
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepPlaceholder
              title="Availability"
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <StepPlaceholder
              title="Photos"
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <StepPlaceholder
              title="Review & Publish"
              onBack={goBack}
            />
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
            className="rounded-lg bg-action px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-action/90"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
