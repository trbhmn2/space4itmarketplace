"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";

type ResetState = "form" | "loading" | "success" | "error" | "verifying";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tokenHash] = useState(() => searchParams.get("token_hash") ?? "");
  const [type] = useState(() => (searchParams.get("type") ?? "recovery") as EmailOtpType);
  const [state, setState] = useState<ResetState>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (!tokenHash) {
      setGeneralError("Invalid or missing reset link.");
      setState("error");
      return;
    }

    const supabase = createClient();
    supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
      if (error) {
        setGeneralError("This reset link has expired or is invalid. Please request a new one.");
        setState("error");
      } else {
        setState("form");
      }
    });
  }, [tokenHash, type]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");

    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Passwords do not match");
      return;
    }

    setState("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setGeneralError("Failed to update password. Please try again.");
      setState("form");
      return;
    }

    setState("success");

    const { data: { user } } = await supabase.auth.getUser();
    const isHost = user?.user_metadata?.role_host === true;
    const dest = isHost ? "/dashboard/host" : "/dashboard/storer";

    setTimeout(() => router.push(dest), 2500);
  }, [password, confirmPassword, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(37,62,95,0.08)]">
        <div className="h-[5px] bg-action" />

        <div className="px-8 pb-10 pt-10 text-center sm:px-10">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-black text-white">S4</span>
            </div>
            <span className="text-lg font-black text-primary">Space4It</span>
          </div>

          {state === "verifying" && (
            <div className="py-12">
              <svg className="mx-auto h-8 w-8 animate-spin text-primary/30" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-sm text-[#6B7280]">Verifying your reset link...</p>
            </div>
          )}

          {state === "form" && (
            <div>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
                <circle cx="40" cy="40" r="38" stroke="#253E5F" strokeWidth="1.5" strokeOpacity="0.08" />
                <circle cx="40" cy="40" r="32" fill="#253E5F" fillOpacity="0.03" />
                <rect x="30" y="28" width="20" height="26" rx="3" stroke="#253E5F" strokeWidth="1.8" strokeOpacity="0.5" />
                <circle cx="40" cy="39" r="4" stroke="#E06B6B" strokeWidth="1.8" />
                <path d="M40 43V48" stroke="#E06B6B" strokeWidth="1.8" strokeLinecap="round" />
              </svg>

              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                Choose a new password
              </h1>
              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                Enter your new password below. Make it at least 8 characters long.
              </p>

              {generalError && (
                <div className="mt-4 rounded-lg bg-action/10 px-4 py-3 text-sm text-action">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-primary">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="mt-1 w-full rounded-lg border border-primary/20 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-primary">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="mt-1 w-full rounded-lg border border-primary/20 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                {fieldError && (
                  <p className="text-xs text-action">{fieldError}</p>
                )}
                <button
                  type="submit"
                  className="w-full rounded-full bg-action px-6 py-[16px] text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-[0.98]"
                >
                  Update password
                </button>
              </form>
            </div>
          )}

          {state === "loading" && (
            <div className="py-12">
              <svg className="mx-auto h-8 w-8 animate-spin text-action" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-sm text-[#6B7280]">Updating your password...</p>
            </div>
          )}

          {state === "success" && (
            <div>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
                <circle cx="40" cy="40" r="38" stroke="#E06B6B" strokeWidth="2" style={{ strokeDasharray: 240, strokeDashoffset: 0, animation: "drawCircle .6s ease-out forwards" }} />
                <path d="M26 42L35 51L54 30" stroke="#E06B6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 50, strokeDashoffset: 0, animation: "drawCheck .4s ease-out .4s forwards" }} />
                <style>{`
                  @keyframes drawCircle { from { stroke-dashoffset: 240 } to { stroke-dashoffset: 0 } }
                  @keyframes drawCheck { from { stroke-dashoffset: 50 } to { stroke-dashoffset: 0 } }
                `}</style>
              </svg>
              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                Password updated! 🔒
              </h1>
              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                Your password has been changed. Taking you to your dashboard...
              </p>
            </div>
          )}

          {state === "error" && (
            <div>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
                <circle cx="40" cy="40" r="38" stroke="#253E5F" strokeWidth="1.5" strokeOpacity="0.1" />
                <circle cx="40" cy="40" r="32" fill="#253E5F" fillOpacity="0.03" />
                <circle cx="40" cy="26" r="2" fill="#E06B6B" />
                <rect x="38.5" y="33" width="3" height="16" rx="1.5" fill="#E06B6B" />
                <rect x="38.5" y="53" width="3" height="3" rx="1.5" fill="#E06B6B" />
              </svg>
              <h1 className="mt-8 text-[28px] font-bold leading-tight text-[#1A2E45]">
                This link has expired
              </h1>
              <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-[1.7] text-[#6B7280]">
                {generalError || "Password reset links expire after 1 hour for security."}
              </p>
              <a
                href="/auth"
                className="mt-8 inline-block w-full rounded-full border-2 border-action px-6 py-[16px] text-[15px] font-bold text-action transition-all duration-200 hover:bg-action hover:text-white"
              >
                Request a new link &rarr;
              </a>
              <p className="mt-5 text-xs text-[#9CA3AF]">
                Need help?{" "}
                <a href="mailto:hello@space4it.co.uk" className="underline">hello@space4it.co.uk</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
