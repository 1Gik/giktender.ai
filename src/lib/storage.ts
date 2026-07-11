import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function storeUploadedFile(input: {
  namespace: string;
  entityId: string;
  file: File;
}) {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const dir = join("/tmp", "giktender-uploads", input.namespace, input.entityId);
  const safeName = `${Date.now()}-${input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storageKey = join(dir, safeName);

  await mkdir(dir, { recursive: true });
  await writeFile(storageKey, buffer);

  return {
    storageProvider: "local_tmp",
    storageKey,
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
  };
}

export async function storeJsonArtifact(input: {
  namespace: string;
  entityId: string;
  fileName: string;
  content: unknown;
}) {
  const dir = join("/tmp", "giktender-uploads", input.namespace, input.entityId);
  const storageKey = join(dir, input.fileName);

  await mkdir(dir, { recursive: true });
  await writeFile(storageKey, JSON.stringify(input.content, null, 2), "utf8");

  return {
    storageProvider: "local_tmp",
    storageKey,
    mimeType: "application/json",
  };
}
