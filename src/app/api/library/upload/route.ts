import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Uploads a file to Cloudflare R2 (free tier, S3-compatible object storage)
 * and returns its public URL so it can be saved as `library_items.file_url`.
 *
 * Required environment variables (set these in .env.local and in Vercel →
 * Project Settings → Environment Variables):
 *
 *   CLOUDFLARE_R2_ACCOUNT_ID       — your Cloudflare account ID
 *   CLOUDFLARE_R2_ACCESS_KEY_ID    — R2 API token access key ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY— R2 API token secret access key
 *   CLOUDFLARE_R2_BUCKET_NAME      — the R2 bucket name to upload into
 *   CLOUDFLARE_R2_PUBLIC_URL       — the public base URL for the bucket
 *                                    (either the bucket's r2.dev public URL,
 *                                    or a custom domain you attached to it),
 *                                    e.g. https://pub-xxxx.r2.dev or
 *                                    https://files.yourdomain.com
 *
 * The upload itself never touches the browser's memory-only blob URL —
 * previously `handleUploadFiles` used `URL.createObjectURL(file)`, which
 * only exists inside that one browser tab and disappears on reload / is
 * invisible to any other device. This route makes storage real and shared.
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — Cloudflare R2 free tier friendly cap

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Thiếu cấu hình Cloudflare R2. Vui lòng đặt CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY trong biến môi trường."
    );
  }

  // CLOUDFLARE_R2_ACCOUNT_ID can be given either as the bare account ID
  // (e.g. "eec1498b59d592a9d2cc3bf6c0e39eb6") or as the full R2 endpoint
  // (e.g. "https://eec1498b59d592a9d2cc3bf6c0e39eb6.r2.cloudflarestorage.com"
  // — this is exactly what appears in .env.local for this project). Accept
  // both so the same env file works without renaming anything.
  const endpoint = accountId.startsWith("http")
    ? accountId
    : `https://${accountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Personal single-user app — no login wall. Files are still namespaced
    // under a fixed "local-user" folder in R2 so the key layout stays the
    // same shape as before (in case multi-user support is added later).
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!bucketName || !publicUrl) {
      return NextResponse.json(
        { error: "Thiếu CLOUDFLARE_R2_BUCKET_NAME hoặc CLOUDFLARE_R2_PUBLIC_URL trong biến môi trường." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Không tìm thấy tệp trong yêu cầu." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Tệp vượt quá giới hạn 50MB." }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `library/local-user/${Date.now()}-${safeName}`;

    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );

    const fileUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ url: fileUrl, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định khi tải tệp lên.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
