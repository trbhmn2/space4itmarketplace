"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function RoleSplitCards() {
  const { user } = useAuth();
  const isHost = user?.user_metadata?.role_host === true;
  return (
    <section className="mx-auto grid max-w-4xl gap-6 px-4 md:grid-cols-2">
      <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-action/10">
          <svg
            className="h-8 w-8 text-action"
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
        </div>
        <h3 className="text-xl font-bold text-primary">
          I need to store my stuff
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-primary/60">
          Find a trusted local host to safely store your belongings over the
          holidays. Affordable, flexible, and hassle-free.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-block rounded-lg bg-action px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md"
        >
          Browse Hosts
        </Link>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <svg
            className="h-8 w-8 text-accent"
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
        </div>
        <h3 className="text-xl font-bold text-primary">I have spare space</h3>
        <p className="mt-3 text-sm leading-relaxed text-primary/60">
          Earn money by offering spare room in your home during the breaks. Set
          your own prices and availability.
        </p>
        <Link
          href={isHost ? "/listing/create" : "/auth?role=host"}
          className="mt-6 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-md"
        >
          Become a Host
        </Link>
      </div>
    </section>
  );
}
