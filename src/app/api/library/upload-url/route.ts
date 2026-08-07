import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const maxDuration = 60;

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Thiếu cấu hình Cloudflare R2 trong môi trường Vercel."
    );
  }

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
        { error: "Thiếu CLOUDFLARE_R2_BUCKET_NAME hoặc CLOUDFLARE_R2_PUBLIC_URL." },
        { status: 500 }
      );
    }

    const { filename, contentType } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "Thiếu tên tệp." }, { status: 400 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._\-()]/g, "_");
    const key = `library/uploads/${Date.now()}-${safeName}`;
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    // Generate presigned upload URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    const fileUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ uploadUrl, fileUrl, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định khi tạo URL upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
