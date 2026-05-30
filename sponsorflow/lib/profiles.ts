import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
) {
  const email = user.email;

  if (!email) {
    return;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    throw error;
  }
}
