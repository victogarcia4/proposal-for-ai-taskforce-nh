import { createClient } from "@supabase/supabase-js";
const url =
  process.env.SUPABASE_URL || "https://tpmvahgtmxtgshedtusy.supabase.co";
const publicKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!publicKey)
  throw new Error("Configure a publishable key before verification.");
const client = createClient(url, publicKey, {
  auth: { persistSession: false },
});
for (const table of [
  "nh_profiles",
  "nh_contributions",
  "nh_pulse",
  "nh_roster",
]) {
  const { data, error } = await client.from(table).select("*").limit(1);
  if (!error && data?.length)
    throw new Error(`Public client can read protected ${table}`);
  console.log(
    `${table}: public access blocked (${error?.code || "no visible rows"})`,
  );
}
const { error } = await client.rpc("nh_write", {
  actor: "11111111-1111-4111-8111-111111111111",
  payload: { action: "profile", request_id: crypto.randomUUID() },
});
if (!error) throw new Error("Public client can call privileged write RPC");
console.log(`Write RPC: public execution blocked (${error.code})`);
