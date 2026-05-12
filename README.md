# Gia Phả Họ Mai Đại Từ

Repository: [github.com/Kein95/gia-pha-ho-mai-dai-tu](https://github.com/Kein95/gia-pha-ho-mai-dai-tu)

Ứng dụng quản lý gia phả họ Mai Đại Từ — Duyên Hưng, Nam Ninh, Ninh Bình. Dữ liệu số hóa từ sơ đồ gốc (khổ 107x180cm) do Mai Đăng Hải thực hiện, tháng 10/2025.

## Các tính năng chính

- **Sơ đồ trực quan**: Cây (Tree) và Sơ đồ tư duy (Mindmap)
- **Tìm danh xưng**: Tự động xác định Bác, Chú, Cô, Dì...
- **Quản lý thành viên**: Thông tin, avatar, thứ tự nhánh
- **Quản lý quan hệ**: Hỗ trợ đa thê, đa phu
- **Thống kê & Sự kiện**: Ngày giỗ, nhân khẩu học
- **Sao lưu dữ liệu**: Xuất/nhập JSON, CSV, GEDCOM
- **Bảo mật**: Phân quyền Admin/Editor/Member, Auth.js v5
- **Đa thiết bị**: Tối ưu mobile + desktop

## Cài đặt và Chạy dự án

Stack: **Vercel + Neon Postgres + Auth.js + Vercel Blob**

### Bước 1 — Setup Vercel + Neon + Blob

1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Import repo này → tạo project
3. Tab **Storage** → **Neon Postgres** (Region: Singapore sin1)
4. Tab **Storage** → **Blob** (Name: `giapha-mai-avatars`, Public)

### Bước 2 — Environment Variables

Vercel → **Settings → Environment Variables**:
- `AUTH_SECRET` = `openssl rand -base64 32` (all environments)
- `AUTH_URL` = `http://localhost:3000` (Development only)
- `SITE_NAME` = `Gia Phả Họ Mai Đại Từ`

### Bước 3 — Chạy local

Yêu cầu: [Node.js](https://nodejs.org/en) + [Bun](https://bun.sh/)

```bash
git clone https://github.com/Kein95/gia-pha-ho-mai-dai-tu.git
cd gia-pha-ho-mai-dai-tu
bun install

# Pull env vars trực tiếp từ Vercel
npx vercel link
npx vercel env pull .env.local

# Push schema (chỉ lần đầu; sau đó dùng db:migrate)
bun run db:push

# Tạo admin — thêm vào .env.local:
#   ADMIN_EMAIL=your@email.com
#   ADMIN_PASSWORD=<strong-password>
#   ADMIN_NAME=Admin
bun scripts/seed-admin.ts

# Import gia phả (~183 thành viên, 11 đời)
# ⚠️ Tự abort nếu DB đã có data — dùng --force để re-seed
bun run seed:mai

# Chạy dev
bun run dev
```

### Bước 4 — Deploy

Vercel tự deploy mỗi push lên `main`.

Xem thêm: [docs/deployment-guide.md](docs/deployment-guide.md)

---

## Phân quyền

1. **Admin**: Toàn quyền
2. **Editor**: Thêm/sửa/xóa hồ sơ và quan hệ
3. **Member**: Chỉ xem

## Giấy phép

MIT
