import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Uploads a file to Cloudflare R2 (free tier, S3-compatible object storage)
 * and returns its public URL so it can be saved as `library_items.file_url`.
 *
 * Required environment variables:
 *   CLOUDFLARE_R2_ACCOUNT_ID       — R2 endpoint URL or bare account ID
 *   CLOUDFLARE_R2_ACCESS_KEY_ID    — R2 API token access key ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY— R2 API token secret access key
 *   CLOUDFLARE_R2_BUCKET_NAME      — the R2 bucket name
 *   CLOUDFLARE_R2_PUBLIC_URL       — the public base URL for the bucket
 *
 * TROUBLESHOOTING "Access Denied":
 *   1. Go to Cloudflare Dashboard → R2 → API Tokens
 *   2. Create/edit the token: set "Permissions" to "Object Read & Write"
 *      and "Bucket" to your specific bucket (or "All buckets")
 *   3. Make sure the bucket exists and has "Public Access" enabled via
 *      R2 → your bucket → Settings → Public Access → Allow Access
 *   4. Add the env vars to Vercel: Project → Settings → Environment Variables
 */

export const maxDuration = 60;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Thiếu cấu hình Cloudflare R2. Vui lòng đặt CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY trong biến môi trường Vercel."
    );
  }

  // Accept both bare account ID and full endpoint URL
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
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!bucketName || !publicUrl) {
      return NextResponse.json(
        { error: "Thiếu CLOUDFLARE_R2_BUCKET_NAME hoặc CLOUDFLARE_R2_PUBLIC_URL trong biến môi trường Vercel." },
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

    const safeName = file.name.replace(/[^a-zA-Z0-9._\-()]/g, "_");
    const key = `library/uploads/${Date.now()}-${safeName}`;

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
