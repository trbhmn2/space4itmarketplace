"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";

type ConfirmState = "idle" | "loading" | "success" | "error";

function EnvelopeSVG() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <circle cx="40" cy="40" r="38" stroke="#253E5F" strokeWidth="1.5" strokeOpacity="0.08" />
      <circle cx="40" cy="40" r="32" fill="#253E5F" fillOpacity="0.03" />
      <rect x="22" y="30" width="36" height="24" rx="3" stroke="#253E5F" strokeWidth="1.8" strokeOpacity="0.5" />
      <path d="M22 33L40 45L58 33" stroke="#E06B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 54L33 44" stroke="#253E5F" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.25" />
      <path d="M58 54L47 44" stroke="#253E5F" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.25" />
    </svg>
  );
}

function CheckmarkSVG() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <circle cx="40" cy="40" r="38" stroke="#E06B6B" strokeWidth="2" className="animate-draw-circle" />
      <path
        d="M26 42L35 51L54 30"
        stroke="#E06B6B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-check"
      />
      <style>{`
        @keyframes drawCircle {
          from { stroke-dashoffset: 240; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-circle {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          animation: drawCircle 0.6s ease-out forwards;
        }
        .animate-draw-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.4s ease-out 0.4s forwards;
        }
      `}</style>
    </svg>
  );
}

function ErrorSVG() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <circle cx="40" cy="40" r="38" stroke="#253E5F" strokeWidth="1.5" strokeOpacity="0.1" />
      <circle cx="40" cy="40" r="32" fill="#253E5F" fillOpacity="0.03" />
      <circle cx="40" cy="26" r="2" fill="#E06B6B" />
      <rect x="38.5" y="33" width="3" height="16" rx="1.5" fill="#E06B6B" />
      <rect x="38.5" y="53" width="3" height="3" rx="1.5" fill="#E06B6B" />
    </svg>
  );
}

function ProgressBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-3xl bg-action/10">
      <div className="h-full animate-progress-sweep rounded-full bg-action" />
      <style>{`
        @keyframes progressSweep {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-sweep {
          animation: progressSweep 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

function getDashboardRoute(user: { user_metadata?: Record<string, unknown> } | null): string {
  const meta = user?.user_metadata;
  if (meta?.role_host) return "/dashboard/host";
  return "/dashboard/storer";
}

function ConfirmPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tokenHash] = useState(() => searchParams.get("token_hash") ?? "");
  const [code] = useState(() => searchParams.get("code") ?? "");
  const [type] = useState(() => (searchParams.get("type") ?? "") as EmailOtpType);
  const [email] = useState(() => searchParams.get("email") ?? "");
  const [state, setState] = useState<ConfirmState>("idle");
  const [redirectPath, setRedirectPath] = useState("/dashboard/storer");

  const hasParams = code.length > 0 || tokenHash.length > 0;

  const handleConfirm = useCallback(async () => {
    if (!hasParams) return;
    setState("loading");

    const supabase = createClient();

    let user: { user_metadata?: Record<string, unknown> } | null = null;
    let confirmError: { message: string } | null = null;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      user = data.user;
      confirmError = error;
    } else if (tokenHash.startsWith("pkce_")) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(tokenHash);
      user = data.user;
      confirmError = error;
    } else {
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });
      user = data.user;
      confirmError = error;
    }

    if (confirmError) {
      setState("error");
      return;
    }

    const dest = getDashboardRoute(user);
    setRedirectPath(dest);
    setState("success");

    setTimeout(() => {
      router.push(dest);
    }, 2200);
  }, [hasParams, tokenHash, type, router]);

  useEffect(() => {
    if (!hasParams) {
      setState("error");
    }
  }, [hasParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(37,62,95,0.08)]">
        {/* Coral top stripe */}
        <div className="h-[5px] bg-action" />

        <div
          className="px-8 pb-10 pt-10 text-center transition-all duration-300 ease-in-out sm:px-10"
        >
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-black text-white">S4</span>
            </div>
            <span className="text-lg font-black text-primary">Space4It</span>
          </div>

          {/* === IDLE STATE === */}
          {state === "idle" && (
            <div className="animate-fade-in">
              <EnvelopeSVG />

              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                You&rsquo;re almost in
              </h1>

              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                Click the button below to confirm your email address and activate
                your Space4It account.
              </p>

              {email && (
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-4 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#253E5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7L12 13L2 7" />
                  </svg>
                  <span className="text-xs font-medium text-primary/70">{email}</span>
                </div>
              )}

              <button
                onClick={handleConfirm}
                className="mt-8 w-full rounded-full bg-action px-6 py-[18px] text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-[0.98]"
              >
                Confirm my account &rarr;
              </button>

              <p className="mt-4 text-xs text-[#9CA3AF]">
                This link expires in 1 hour
              </p>
            </div>
          )}

          {/* === LOADING STATE === */}
          {state === "loading" && (
            <div className="animate-fade-in">
              <EnvelopeSVG />

              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                You&rsquo;re almost in
              </h1>

              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                Click the button below to confirm your email address and activate
                your Space4It account.
              </p>

              {email && (
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-4 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#253E5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7L12 13L2 7" />
                  </svg>
                  <span className="text-xs font-medium text-primary/70">{email}</span>
                </div>
              )}

              <button
                disabled
                className="mt-8 flex w-full items-center justify-center rounded-full bg-action px-6 py-[18px] text-[15px] font-bold text-white opacity-80 shadow-sm"
              >
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </button>

              <p className="mt-4 text-xs text-[#9CA3AF]">
                Verifying your email...
              </p>
            </div>
          )}

          {/* === SUCCESS STATE === */}
          {state === "success" && (
            <div className="animate-fade-in">
              <CheckmarkSVG />

              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                You&rsquo;re in! 🎉
              </h1>

              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                Your Space4It account is confirmed. Taking you to your dashboard...
              </p>

              <div className="mt-8">
                <a
                  href={redirectPath}
                  className="inline-flex items-center gap-2 text-sm font-medium text-action hover:underline"
                >
                  Go to dashboard &rarr;
                </a>
              </div>
            </div>
          )}

          {/* === ERROR STATE === */}
          {state === "error" && (
            <div className="animate-fade-in">
              <ErrorSVG />

              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                This link has expired
              </h1>

              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                Confirmation links expire after 1 hour for security. Request a
                fresh one below and click it straight away.
              </p>

              <a
                href="/auth"
                className="mt-8 inline-block w-full rounded-full border-2 border-action px-6 py-[16px] text-[15px] font-bold text-action transition-all duration-200 hover:bg-action hover:text-white"
              >
                Send a new link &rarr;
              </a>

              <p className="mt-5 text-xs text-[#9CA3AF]">
                Need help? Contact us at{" "}
                <a href="mailto:hello@space4it.co.uk" className="underline">
                  hello@space4it.co.uk
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Success progress bar */}
        {state === "success" && <ProgressBar />}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmPageInner />
    </Suspense>
  );
}
