"use server";

import { put } from "@vercel/blob";
import { requireEditor } from "@/lib/auth/permissions";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadAvatar(formData: FormData) {
  await requireEditor();

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Không có file" };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Định dạng không hỗ trợ. Chỉ PNG/JPG/GIF/WebP." };
  }

  if (file.size > MAX_SIZE) {
    return { error: "File quá lớn. Tối đa 2MB." };
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `avatars/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  try {
    const uploaded = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });
    return { url: uploaded.url };
  } catch (e) {
    console.error("Avatar upload failed:", e);
    return { error: "Tải ảnh lên thất bại. Vui lòng thử lại." };
  }
}
