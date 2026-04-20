"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [storer, setStorer] = useState(false);
  const [host, setHost] = useState(false);

  const hasSelection = storer || host;

  function handleContinue() {
    if (!hasSelection) return;
    const params = new URLSearchParams({
      role_storer: String(storer),
      role_host: String(host),
    });
    router.push(`/auth?${params.toString()}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 pt-12 pb-16">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <span className="text-base font-black text-white">S4</span>
        </div>
        <span className="text-2xl font-black text-primary">Space4It</span>
      </Link>

      {/* Heading */}
      <h1 className="text-center text-2xl font-bold text-primary sm:text-3xl">
        How would you like to use Space4It?
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-primary/60">
        Choose one or both options below. You can always change this later in
        your settings.
      </p>

      {/* Cards */}
      <div className="mt-10 flex w-full max-w-2xl flex-col gap-5 sm:flex-row">
        {/* Start Storing */}
        <button
          type="button"
          onClick={() => setStorer((prev) => !prev)}
          className={`relative flex flex-1 flex-col items-center rounded-2xl border-2 p-8 text-center transition-all duration-200 ${
            storer
              ? "border-action bg-action text-white shadow-lg shadow-action/20"
              : "border-action/30 bg-white text-action hover:border-action/60 hover:shadow-md"
          }`}
        >
          {storer && (
            <div className="absolute right-3 top-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          )}
          {/* Box / Storage icon */}
          <svg
            className={`mb-4 h-12 w-12 ${storer ? "text-white" : "text-action"}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
          <h2 className="text-lg font-bold">Start Storing</h2>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              storer ? "text-white/80" : "text-primary/50"
            }`}
          >
            Find trusted student hosts with spare space to store your boxes,
            bikes, and belongings over the holidays.
          </p>
        </button>

        {/* Start Hosting */}
        <button
          type="button"
          onClick={() => setHost((prev) => !prev)}
          className={`relative flex flex-1 flex-col items-center rounded-2xl border-2 p-8 text-center transition-all duration-200 ${
            host
              ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
              : "border-accent/30 bg-white text-accent hover:border-accent/60 hover:shadow-md"
          }`}
        >
          {host && (
            <div className="absolute right-3 top-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          )}
          {/* Home icon */}
          <svg
            className={`mb-4 h-12 w-12 ${host ? "text-white" : "text-accent"}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          <h2 className="text-lg font-bold">Start Hosting</h2>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              host ? "text-white/80" : "text-primary/50"
            }`}
          >
            Earn money by offering your spare room, garage, or cupboard to
            fellow students who need storage.
          </p>
        </button>
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!hasSelection}
        className={`mt-10 w-full max-w-2xl rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
          hasSelection
            ? "bg-action text-white shadow-md hover:opacity-90"
            : "cursor-not-allowed bg-primary/10 text-primary/30"
        }`}
      >
        Continue
      </button>
    </main>
  );
}
