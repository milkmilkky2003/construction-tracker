import { ENV } from "./_core/env";

function getSupabaseConfig() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase storage config missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return {
    url: ENV.supabaseUrl.replace(/\/+$/, ""),
    key: ENV.supabaseServiceRoleKey,
    bucket: ENV.supabaseStorageBucket,
  };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map(part => encodeURIComponent(part))
    .join("/");
}

async function supabaseStoragePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const { url, key: serviceRoleKey, bucket } = getSupabaseConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const encodedPath = encodeStoragePath(key);
  const uploadUrl = `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;
  const body =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });

  const uploadResp = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });

  if (!uploadResp.ok) {
    const msg = await uploadResp.text().catch(() => uploadResp.statusText);
    throw new Error(`Supabase storage upload failed (${uploadResp.status}): ${msg}`);
  }

  return {
    key,
    url: `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`,
  };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  return supabaseStoragePut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const { url, bucket } = getSupabaseConfig();
  const encodedPath = encodeStoragePath(key);
  return { 
    key, 
    url: `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`
  };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  const { url, key: serviceRoleKey, bucket } = getSupabaseConfig();
  const encodedPath = encodeStoragePath(key);
  
  const signUrl = `${url}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodedPath}`;
  
  const resp = await fetch(signUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Supabase storage signed URL failed (${resp.status}): ${msg}`);
  }

  const { signedURL } = (await resp.json()) as { signedURL: string };
  return `${url}${signedURL}`;
}
