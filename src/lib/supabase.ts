import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Doesn't throw — a missing key would otherwise take down the whole app
  // (including the working calling feature, which has nothing to do with
  // Supabase). Sign-in/contacts just won't work until these are set; see
  // CALL_FIX_README_AR.md for where VITE_SUPABASE_URL and
  // VITE_SUPABASE_ANON_KEY come from and how to wire them into CI.
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — sign-in and contacts won't work.",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    // We're in a Capacitor WebView, not a normal browser tab — persisting
    // the session (localStorage, which Capacitor's WebView backs with a
    // real on-device store) is what makes sign-in "stick" across app
    // relaunches instead of asking to sign in every time.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Deliberately implicit, not PKCE: PKCE needs its code_verifier to
    // still be in this WebView's localStorage when the redirect comes
    // back — but the OAuth screen opens in an external browser (a
    // separate app/task), and Android is free to kill our app's process
    // while the person is over there. When that happens the verifier is
    // gone before exchangeCodeForSession() ever runs ("invalid flow
    // state"). Implicit flow sidesteps this entirely: the tokens come
    // back directly in the redirect URL's fragment (see
    // completeSignIn() in auth.ts), so there's nothing that needs to have
    // survived in storage.
    flowType: "implicit",
  },
});
