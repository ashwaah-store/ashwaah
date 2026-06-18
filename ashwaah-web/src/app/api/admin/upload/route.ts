import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with keys from .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Stream upload directly to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ashwaah_store", // Folder name in Cloudinary media library
          resource_type: "auto",   // Automatically detects image or video type
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    const secureUrl = uploadResult.secure_url;
    
    // Inject f_auto (auto format) and q_auto (auto quality) optimization parameters
    const optimizedUrl = secureUrl.replace("/upload/", "/upload/f_auto,q_auto/");

    return NextResponse.json({ success: true, url: optimizedUrl });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload file to Cloudinary" }, { status: 500 });
  }
}
