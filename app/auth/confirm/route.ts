import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard/storer";

  console.log("=== AUTH CONFIRM HIT ===");
  console.log("token_hash:", token_hash);
  console.log("type:", type);
  console.log("next:", next);
  console.log("user agent:", request.headers.get("user-agent"));
  console.log("full url:", request.url);

  if (token_hash && type) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, _options: CookieOptions) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    console.log("verifyOtp data:", JSON.stringify(data, null, 2));
    console.log("verifyOtp error:", error ? { message: error.message, status: error.status } : null);

    if (!error) {
      console.log("SUCCESS — redirecting to:", next);
      return NextResponse.redirect(new URL(next, request.url));
    }

    console.log("FAILED — redirecting to /auth?error=confirmation_failed");
  } else {
    console.log("MISSING PARAMS — token_hash or type is null");
  }

  return NextResponse.redirect(
    new URL("/auth?error=confirmation_failed", request.url)
  );
}
