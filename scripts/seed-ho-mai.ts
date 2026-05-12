/**
 * CLI seed script: import Mai family genealogy data into Neon Postgres via Drizzle ORM.
 *
 * Reads DB connection from .env.local (POSTGRES_URL).
 * TRUNCATES persons and relationships tables before insert (idempotent).
 * Wraps all inserts in a transaction for atomicity.
 *
 * Usage:
 *   bun scripts/seed-ho-mai.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "drizzle-orm";
import { sql as vercelSql } from "@vercel/postgres";
import * as schema from "@/lib/db/schema";

const db = drizzle(vercelSql, { schema });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersonSeed {
  fullName: string;
  gender: "male" | "female" | "other";
  generation: number;
  deathLunarDay?: number;
  deathLunarMonth?: number;
  note?: string;
}

interface RelationshipSeed {
  parentKey: string; // "name|generation"
  childKey: string; // "name|generation"
}

// ---------------------------------------------------------------------------
// Persons data — all 186 persons from the Mai family genealogy
// Key format for dedup: "fullName|generation"
// Prefixes removed: "Cao cao tổ", "CỤ TỔ", "CÔ TỔ", "CỤ"
// All persons are historical figures: isDeceased=true
// Default gender: male, except Mai Thị Xuân Phương = female
// ---------------------------------------------------------------------------

const personsData: PersonSeed[] = [
  // -- Đời 1 --
  { fullName: "Mai Nhất Lang", gender: "male", generation: 1 },

  // -- Đời 2 --
  { fullName: "Mai Nhị Lang", gender: "male", generation: 2 },

  // -- Đời 3 --
  { fullName: "Mai Nhiêu Tuật", gender: "male", generation: 3, deathLunarDay: 5, deathLunarMonth: 1 },
  { fullName: "Mai Thị Xuân Phương", gender: "female", generation: 3, deathLunarDay: 25, deathLunarMonth: 3 },

  // -- Đời 4 --
  { fullName: "Đồ Phái", gender: "male", generation: 4, deathLunarDay: 30, deathLunarMonth: 4 },
  { fullName: "Thứ Nguyên", gender: "male", generation: 4, deathLunarDay: 14, deathLunarMonth: 2 },
  { fullName: "Mai Đăng Duy", gender: "male", generation: 4 },
  { fullName: "Tránh Đán", gender: "male", generation: 4, deathLunarDay: 15, deathLunarMonth: 7 },
  { fullName: "Đồ Thu", gender: "male", generation: 4, deathLunarDay: 14, deathLunarMonth: 8 },

  // -- Đời 5 --
  { fullName: "Tú Điển", gender: "male", generation: 5, deathLunarDay: 12, deathLunarMonth: 10 },
  { fullName: "Nhị Lân", gender: "male", generation: 5 },
  { fullName: "Đồ Chấn", gender: "male", generation: 5 },
  { fullName: "Mai Đăng Đạo", gender: "male", generation: 5, note: "con cháu ở Hưng Yên" },
  { fullName: "Con Tránh Đán", gender: "male", generation: 5, note: "con cháu ở Hải Phòng" },
  { fullName: "Lý Liêm", gender: "male", generation: 5 },
  { fullName: "Tổng Cuông", gender: "male", generation: 5 },

  // -- Đời 6 --
  { fullName: "Nhĩ Vỡi", gender: "male", generation: 6 },
  { fullName: "Bạ Tập", gender: "male", generation: 6 },
  { fullName: "Rựu", gender: "male", generation: 6 },
  { fullName: "Riệm", gender: "male", generation: 6 },
  { fullName: "Yên", gender: "male", generation: 6 },
  { fullName: "Phó Phước", gender: "male", generation: 6 },
  { fullName: "Đồ Tuân", gender: "male", generation: 6 },
  { fullName: "Tiệm", gender: "male", generation: 6 },
  { fullName: "Nhất Tốn", gender: "male", generation: 6 },
  { fullName: "Lý Chất", gender: "male", generation: 6 },
  { fullName: "Ngạc", gender: "male", generation: 6 },
  { fullName: "Tống Thiện", gender: "male", generation: 6 },

  // -- Đời 7 --
  { fullName: "Lý Rẫn", gender: "male", generation: 7 },
  { fullName: "Loại", gender: "male", generation: 7 },
  { fullName: "Quỳ", gender: "male", generation: 7 },
  { fullName: "Cư", gender: "male", generation: 7 },
  { fullName: "Huỳnh", gender: "male", generation: 7 },
  { fullName: "Oánh", gender: "male", generation: 7 },
  { fullName: "Roanh", gender: "male", generation: 7 },
  { fullName: "Yêm", gender: "male", generation: 7 },
  { fullName: "Đạm", gender: "male", generation: 7 },
  { fullName: "Úc", gender: "male", generation: 7 },
  { fullName: "Cạnh", gender: "male", generation: 7 },
  { fullName: "Ưng", gender: "male", generation: 7 },
  { fullName: "Trạc", gender: "male", generation: 7 },
  { fullName: "Ngời", gender: "male", generation: 7 },
  { fullName: "Vịnh", gender: "male", generation: 7 },
  { fullName: "Tiệc", gender: "male", generation: 7 },
  { fullName: "Lưu", gender: "male", generation: 7 },
  { fullName: "Tân", gender: "male", generation: 7 },
  { fullName: "Khiêm", gender: "male", generation: 7 },
  { fullName: "Soạn", gender: "male", generation: 7 },
  { fullName: "Nhận", gender: "male", generation: 7 },
  { fullName: "Đoái", gender: "male", generation: 7 },
  { fullName: "Căn", gender: "male", generation: 7 },
  { fullName: "Đề", gender: "male", generation: 7 },
  { fullName: "Khánh", gender: "male", generation: 7 },

  // -- Đời 8 --
  { fullName: "Loát", gender: "male", generation: 8 },
  { fullName: "Choát", gender: "male", generation: 8 },
  { fullName: "Phát", gender: "male", generation: 8 },
  { fullName: "Nhiêu", gender: "male", generation: 8 },
  { fullName: "Chúc", gender: "male", generation: 8 },
  { fullName: "Thể", gender: "male", generation: 8 },
  { fullName: "Chế", gender: "male", generation: 8 },
  { fullName: "Độ", gender: "male", generation: 8 },
  { fullName: "Cự", gender: "male", generation: 8 },
  { fullName: "Lụt", gender: "male", generation: 8 },
  { fullName: "Tuynh", gender: "male", generation: 8 },
  { fullName: "Chinh", gender: "male", generation: 8 },
  { fullName: "Tú", gender: "male", generation: 8 },
  { fullName: "Thuần", gender: "male", generation: 8 },
  { fullName: "Thuấn", gender: "male", generation: 8 },
  { fullName: "Thuân", gender: "male", generation: 8 },
  { fullName: "Thúy", gender: "male", generation: 8 },
  { fullName: "Tình", gender: "male", generation: 8 },
  { fullName: "Thắm", gender: "male", generation: 8 },
  { fullName: "Cảnh", gender: "male", generation: 8 },
  { fullName: "Tản", gender: "male", generation: 8 },
  { fullName: "Điềm", gender: "male", generation: 8 },
  { fullName: "Huynh", gender: "male", generation: 8 },
  { fullName: "Viện", gender: "male", generation: 8 },
  { fullName: "Thảo", gender: "male", generation: 8 },

  // -- Đời 9 --
  { fullName: "Quỹ", gender: "male", generation: 9 },
  { fullName: "Kho", gender: "male", generation: 9 },
  { fullName: "Phú", gender: "male", generation: 9 },
  { fullName: "Hào", gender: "male", generation: 9 },
  { fullName: "Hoa", gender: "male", generation: 9 },
  { fullName: "Hoàn", gender: "male", generation: 9 },
  { fullName: "Tĩnh", gender: "male", generation: 9 },
  { fullName: "Phán", gender: "male", generation: 9 },
  { fullName: "Tiếp", gender: "male", generation: 9 },
  { fullName: "Khách", gender: "male", generation: 9 },
  { fullName: "Trường", gender: "male", generation: 9 },
  { fullName: "Tiến", gender: "male", generation: 9 },
  { fullName: "Thám", gender: "male", generation: 9 },
  { fullName: "Dũng", gender: "male", generation: 9 },
  { fullName: "Phương", gender: "male", generation: 9 },
  { fullName: "Tuấn", gender: "male", generation: 9 },
  { fullName: "Thùy", gender: "male", generation: 9 },
  { fullName: "Ba", gender: "male", generation: 9 },
  { fullName: "Tư", gender: "male", generation: 9 },
  { fullName: "Tái", gender: "male", generation: 9 },
  { fullName: "Mừng", gender: "male", generation: 9 },
  { fullName: "Hiển", gender: "male", generation: 9 },
  { fullName: "Hoạch", gender: "male", generation: 9 },
  { fullName: "Bắc", gender: "male", generation: 9 },
  { fullName: "Tịnh", gender: "male", generation: 9 },
  { fullName: "Nhân", gender: "male", generation: 9 },
  { fullName: "Thiện", gender: "male", generation: 9 },
  { fullName: "Thành", gender: "male", generation: 9 },
  { fullName: "Lực", gender: "male", generation: 9 },
  { fullName: "Tân", gender: "male", generation: 9 },
  { fullName: "Toán", gender: "male", generation: 9 },
  { fullName: "Hùng", gender: "male", generation: 9, note: "THIẾT" },
  { fullName: "Bình", gender: "male", generation: 9 },
  { fullName: "Luận", gender: "male", generation: 9 },
  { fullName: "Nghị", gender: "male", generation: 9 },
  { fullName: "Thịnh", gender: "male", generation: 9 },

  // -- Đời 10 --
  { fullName: "Quynh", gender: "male", generation: 10 },
  { fullName: "Hùng", gender: "male", generation: 10 },
  { fullName: "Thịnh", gender: "male", generation: 10 },
  { fullName: "Kha", gender: "male", generation: 10 },
  { fullName: "Khương", gender: "male", generation: 10 },
  { fullName: "Bình", gender: "male", generation: 10 },
  { fullName: "Đạt", gender: "male", generation: 10 },
  { fullName: "Anh", gender: "male", generation: 10 },
  { fullName: "Dương", gender: "male", generation: 10 },
  { fullName: "Duy", gender: "male", generation: 10 },
  { fullName: "Quốc", gender: "male", generation: 10 },
  { fullName: "Bảo", gender: "male", generation: 10 },
  { fullName: "Tuấn", gender: "male", generation: 10 },
  { fullName: "Tú", gender: "male", generation: 10 },
  { fullName: "Giang", gender: "male", generation: 10 },
  { fullName: "Nam", gender: "male", generation: 10 },
  { fullName: "Hòa", gender: "male", generation: 10 },
  { fullName: "Linh", gender: "male", generation: 10 },
  { fullName: "Quý", gender: "male", generation: 10 },
  { fullName: "Mạnh", gender: "male", generation: 10 },
  { fullName: "Long", gender: "male", generation: 10 },
  { fullName: "Việt", gender: "male", generation: 10 },
  { fullName: "Thư", gender: "male", generation: 10 },
  { fullName: "Phúc", gender: "male", generation: 10 },
  { fullName: "Linh (2)", gender: "male", generation: 10 },
  { fullName: "Phan", gender: "male", generation: 10 },
  { fullName: "Bình (2)", gender: "male", generation: 10 },
  { fullName: "Bính", gender: "male", generation: 10 },
  { fullName: "Quyết", gender: "male", generation: 10 },
  { fullName: "Mười", gender: "male", generation: 10 },
  { fullName: "Trọng", gender: "male", generation: 10 },
  { fullName: "Diện", gender: "male", generation: 10 },
  { fullName: "Long (2)", gender: "male", generation: 10 },
  { fullName: "Bộ", gender: "male", generation: 10 },
  { fullName: "Nguyên", gender: "male", generation: 10 },
  { fullName: "Thuận", gender: "male", generation: 10 },
  { fullName: "Khải", gender: "male", generation: 10 },
  { fullName: "Khôi", gender: "male", generation: 10 },
  { fullName: "Kiên", gender: "male", generation: 10 },
  { fullName: "Đăng", gender: "male", generation: 10 },
  { fullName: "Tuấn (2)", gender: "male", generation: 10 },
  { fullName: "Kháng", gender: "male", generation: 10 },
  { fullName: "Tuấn (3)", gender: "male", generation: 10 },
  { fullName: "Phúc (2)", gender: "male", generation: 10 },
  { fullName: "Minh", gender: "male", generation: 10 },
  { fullName: "Đạt (2)", gender: "male", generation: 10 },
  { fullName: "Sơn", gender: "male", generation: 10 },
  { fullName: "Dũng (2)", gender: "male", generation: 10 },
  { fullName: "Vinh", gender: "male", generation: 10 },
  { fullName: "Huy", gender: "male", generation: 10 },
  { fullName: "Phúc (3)", gender: "male", generation: 10 },

  // -- Đời 11 --
  { fullName: "Hải", gender: "male", generation: 11 },
  { fullName: "Thủy", gender: "male", generation: 11 },
  { fullName: "Tuấn", gender: "male", generation: 11 },
  { fullName: "Khang", gender: "male", generation: 11 },
  { fullName: "Khoa", gender: "male", generation: 11 },
  { fullName: "Phước", gender: "male", generation: 11 },
  { fullName: "Lộc", gender: "male", generation: 11 },
  { fullName: "Đạt", gender: "male", generation: 11 },
  { fullName: "Khôi", gender: "male", generation: 11 },
  { fullName: "Quang", gender: "male", generation: 11 },
  { fullName: "Hải (2)", gender: "male", generation: 11 },
  { fullName: "Long", gender: "male", generation: 11 },
  { fullName: "Dương", gender: "male", generation: 11 },
  { fullName: "Quân", gender: "male", generation: 11 },
  { fullName: "Anh", gender: "male", generation: 11 },
  { fullName: "Hưng", gender: "male", generation: 11 },
  { fullName: "Đức Phúc", gender: "male", generation: 11 },
  { fullName: "Tiến Phúc", gender: "male", generation: 11 },
];

// ---------------------------------------------------------------------------
// Relationships data — all ~182 parent-child pairs
// Key format: "fullName|generation" matching personsData
// Type: "biological_child" for all (traditional genealogy)
// ---------------------------------------------------------------------------

const relationshipsData: RelationshipSeed[] = [
  // Đời 1 → Đời 2
  { parentKey: "Mai Nhất Lang|1", childKey: "Mai Nhị Lang|2" },

  // Đời 2 → Đời 3
  { parentKey: "Mai Nhị Lang|2", childKey: "Mai Nhiêu Tuật|3" },
  { parentKey: "Mai Nhị Lang|2", childKey: "Mai Thị Xuân Phương|3" },

  // Đời 3 → Đời 4
  { parentKey: "Mai Nhiêu Tuật|3", childKey: "Đồ Phái|4" },
  { parentKey: "Mai Nhiêu Tuật|3", childKey: "Thứ Nguyên|4" },
  { parentKey: "Mai Nhiêu Tuật|3", childKey: "Mai Đăng Duy|4" },
  { parentKey: "Mai Nhiêu Tuật|3", childKey: "Tránh Đán|4" },
  { parentKey: "Mai Nhiêu Tuật|3", childKey: "Đồ Thu|4" },

  // Đời 4 → Đời 5
  { parentKey: "Đồ Phái|4", childKey: "Tú Điển|5" },
  { parentKey: "Thứ Nguyên|4", childKey: "Nhị Lân|5" },
  { parentKey: "Thứ Nguyên|4", childKey: "Đồ Chấn|5" },
  { parentKey: "Mai Đăng Duy|4", childKey: "Mai Đăng Đạo|5" },
  { parentKey: "Tránh Đán|4", childKey: "Con Tránh Đán|5" },
  { parentKey: "Đồ Thu|4", childKey: "Lý Liêm|5" },
  { parentKey: "Đồ Thu|4", childKey: "Tổng Cuông|5" },

  // Đời 5 → Đời 6
  { parentKey: "Tú Điển|5", childKey: "Nhĩ Vỡi|6" },
  { parentKey: "Tú Điển|5", childKey: "Bạ Tập|6" },
  { parentKey: "Tú Điển|5", childKey: "Rựu|6" },
  { parentKey: "Tú Điển|5", childKey: "Riệm|6" },
  { parentKey: "Tú Điển|5", childKey: "Yên|6" },
  { parentKey: "Nhị Lân|5", childKey: "Phó Phước|6" },
  { parentKey: "Đồ Chấn|5", childKey: "Đồ Tuân|6" },
  { parentKey: "Đồ Chấn|5", childKey: "Tiệm|6" },
  { parentKey: "Đồ Chấn|5", childKey: "Nhất Tốn|6" },
  { parentKey: "Đồ Chấn|5", childKey: "Lý Chất|6" },
  { parentKey: "Lý Liêm|5", childKey: "Ngạc|6" },
  { parentKey: "Tổng Cuông|5", childKey: "Tống Thiện|6" },

  // Đời 6 → Đời 7
  { parentKey: "Nhĩ Vỡi|6", childKey: "Lý Rẫn|7" },
  { parentKey: "Nhĩ Vỡi|6", childKey: "Loại|7" },
  { parentKey: "Bạ Tập|6", childKey: "Quỳ|7" },
  { parentKey: "Bạ Tập|6", childKey: "Cư|7" },
  { parentKey: "Rựu|6", childKey: "Huỳnh|7" },
  { parentKey: "Rựu|6", childKey: "Oánh|7" },
  { parentKey: "Rựu|6", childKey: "Roanh|7" },
  { parentKey: "Riệm|6", childKey: "Yêm|7" },
  { parentKey: "Riệm|6", childKey: "Đạm|7" },
  { parentKey: "Phó Phước|6", childKey: "Úc|7" },
  { parentKey: "Phó Phước|6", childKey: "Cạnh|7" },
  { parentKey: "Phó Phước|6", childKey: "Ưng|7" },
  { parentKey: "Đồ Tuân|6", childKey: "Trạc|7" },
  { parentKey: "Đồ Tuân|6", childKey: "Ngời|7" },
  { parentKey: "Đồ Tuân|6", childKey: "Vịnh|7" },
  { parentKey: "Tiệm|6", childKey: "Tiệc|7" },
  { parentKey: "Tiệm|6", childKey: "Lưu|7" },
  { parentKey: "Tiệm|6", childKey: "Tân|7" },
  { parentKey: "Nhất Tốn|6", childKey: "Khiêm|7" },
  { parentKey: "Nhất Tốn|6", childKey: "Soạn|7" },
  { parentKey: "Nhất Tốn|6", childKey: "Nhận|7" },
  { parentKey: "Lý Chất|6", childKey: "Đoái|7" },
  { parentKey: "Ngạc|6", childKey: "Căn|7" },
  { parentKey: "Ngạc|6", childKey: "Đề|7" },
  { parentKey: "Tống Thiện|6", childKey: "Khánh|7" },

  // Đời 7 → Đời 8
  { parentKey: "Lý Rẫn|7", childKey: "Loát|8" },
  { parentKey: "Lý Rẫn|7", childKey: "Choát|8" },
  { parentKey: "Lý Rẫn|7", childKey: "Phát|8" },
  { parentKey: "Loại|7", childKey: "Nhiêu|8" },
  { parentKey: "Loại|7", childKey: "Chúc|8" },
  { parentKey: "Quỳ|7", childKey: "Thể|8" },
  { parentKey: "Quỳ|7", childKey: "Chế|8" },
  { parentKey: "Quỳ|7", childKey: "Độ|8" },
  { parentKey: "Cư|7", childKey: "Cự|8" },
  { parentKey: "Huỳnh|7", childKey: "Lụt|8" },
  { parentKey: "Huỳnh|7", childKey: "Tuynh|8" },
  { parentKey: "Huỳnh|7", childKey: "Chinh|8" },
  { parentKey: "Yêm|7", childKey: "Tú|8" },
  { parentKey: "Đạm|7", childKey: "Thuần|8" },
  { parentKey: "Đạm|7", childKey: "Thuấn|8" },
  { parentKey: "Đạm|7", childKey: "Thuân|8" },
  { parentKey: "Đạm|7", childKey: "Thúy|8" },
  { parentKey: "Đạm|7", childKey: "Tình|8" },
  { parentKey: "Cạnh|7", childKey: "Thắm|8" },
  { parentKey: "Cạnh|7", childKey: "Cảnh|8" },
  { parentKey: "Ưng|7", childKey: "Tản|8" },
  { parentKey: "Khiêm|7", childKey: "Điềm|8" },
  { parentKey: "Đoái|7", childKey: "Huynh|8" },
  { parentKey: "Đoái|7", childKey: "Viện|8" },
  { parentKey: "Đoái|7", childKey: "Thảo|8" },

  // Đời 8 → Đời 9
  { parentKey: "Loát|8", childKey: "Quỹ|9" },
  { parentKey: "Loát|8", childKey: "Kho|9" },
  { parentKey: "Phát|8", childKey: "Phú|9" },
  { parentKey: "Phát|8", childKey: "Hào|9" },
  { parentKey: "Phát|8", childKey: "Hoa|9" },
  { parentKey: "Phát|8", childKey: "Hoàn|9" },
  { parentKey: "Chúc|8", childKey: "Tĩnh|9" },
  { parentKey: "Chế|8", childKey: "Phán|9" },
  { parentKey: "Chế|8", childKey: "Tiếp|9" },
  { parentKey: "Chế|8", childKey: "Khách|9" },
  { parentKey: "Chế|8", childKey: "Trường|9" },
  { parentKey: "Chế|8", childKey: "Tiến|9" },
  { parentKey: "Độ|8", childKey: "Thám|9" },
  { parentKey: "Độ|8", childKey: "Dũng|9" },
  { parentKey: "Cự|8", childKey: "Phương|9" },
  { parentKey: "Cự|8", childKey: "Tuấn|9" },
  { parentKey: "Chinh|8", childKey: "Thùy|9" },
  { parentKey: "Chinh|8", childKey: "Ba|9" },
  { parentKey: "Chinh|8", childKey: "Tư|9" },
  { parentKey: "Chinh|8", childKey: "Tái|9" },
  { parentKey: "Chinh|8", childKey: "Mừng|9" },
  { parentKey: "Tú|8", childKey: "Hiển|9" },
  { parentKey: "Tú|8", childKey: "Hoạch|9" },
  { parentKey: "Tú|8", childKey: "Bắc|9" },
  { parentKey: "Thuần|8", childKey: "Tịnh|9" },
  { parentKey: "Thuần|8", childKey: "Nhân|9" },
  { parentKey: "Thuân|8", childKey: "Thành|9" },
  { parentKey: "Thúy|8", childKey: "Lực|9" },
  { parentKey: "Tình|8", childKey: "Tân|9" },
  { parentKey: "Tình|8", childKey: "Toán|9" },
  { parentKey: "Thắm|8", childKey: "Hùng|9" },
  { parentKey: "Điềm|8", childKey: "Bình|9" },
  { parentKey: "Điềm|8", childKey: "Luận|9" },
  { parentKey: "Điềm|8", childKey: "Nghị|9" },
  { parentKey: "Thảo|8", childKey: "Thịnh|9" },

  // Đời 9 → Đời 10
  { parentKey: "Quỹ|9", childKey: "Quynh|10" },
  { parentKey: "Quỹ|9", childKey: "Hùng|10" },
  { parentKey: "Quỹ|9", childKey: "Thịnh|10" },
  { parentKey: "Kho|9", childKey: "Kha|10" },
  { parentKey: "Kho|9", childKey: "Khương|10" },
  { parentKey: "Phú|9", childKey: "Bình|10" },
  { parentKey: "Hoa|9", childKey: "Đạt|10" },
  { parentKey: "Hoa|9", childKey: "Anh|10" },
  { parentKey: "Hoàn|9", childKey: "Dương|10" },
  { parentKey: "Hoàn|9", childKey: "Duy|10" },
  { parentKey: "Hoàn|9", childKey: "Quốc|10" },
  { parentKey: "Hoàn|9", childKey: "Bảo|10" },
  { parentKey: "Tĩnh|9", childKey: "Tuấn|10" },
  { parentKey: "Tĩnh|9", childKey: "Tú|10" },
  { parentKey: "Phán|9", childKey: "Giang|10" },
  { parentKey: "Phán|9", childKey: "Nam|10" },
  { parentKey: "Tiếp|9", childKey: "Hòa|10" },
  { parentKey: "Khách|9", childKey: "Linh|10" },
  { parentKey: "Trường|9", childKey: "Quý|10" },
  { parentKey: "Trường|9", childKey: "Mạnh|10" },
  { parentKey: "Tiến|9", childKey: "Long|10" },
  { parentKey: "Tiến|9", childKey: "Việt|10" },
  { parentKey: "Thám|9", childKey: "Thư|10" },
  { parentKey: "Dũng|9", childKey: "Phúc|10" },
  { parentKey: "Phương|9", childKey: "Linh (2)|10" },
  { parentKey: "Tuấn|9", childKey: "Phan|10" },
  { parentKey: "Ba|9", childKey: "Bình (2)|10" },
  { parentKey: "Ba|9", childKey: "Bính|10" },
  { parentKey: "Tái|9", childKey: "Quyết|10" },
  { parentKey: "Mừng|9", childKey: "Mười|10" },
  { parentKey: "Mừng|9", childKey: "Trọng|10" },
  { parentKey: "Hiển|9", childKey: "Diện|10" },
  { parentKey: "Hoạch|9", childKey: "Long (2)|10" },
  { parentKey: "Bắc|9", childKey: "Bộ|10" },
  { parentKey: "Tịnh|9", childKey: "Nguyên|10" },
  { parentKey: "Nhân|9", childKey: "Nguyên|10" },
  { parentKey: "Nhân|9", childKey: "Khải|10" },
  { parentKey: "Thiện|9", childKey: "Khôi|10" },
  { parentKey: "Thành|9", childKey: "Kiên|10" },
  { parentKey: "Lực|9", childKey: "Đăng|10" },
  { parentKey: "Lực|9", childKey: "Tuấn (2)|10" },
  { parentKey: "Tân|9", childKey: "Kháng|10" },
  { parentKey: "Toán|9", childKey: "Tuấn (3)|10" },
  { parentKey: "Toán|9", childKey: "Phúc (2)|10" },
  { parentKey: "Hùng|9", childKey: "Minh|10" },
  { parentKey: "Hùng|9", childKey: "Đạt (2)|10" },
  { parentKey: "Bình|9", childKey: "Sơn|10" },
  { parentKey: "Luận|9", childKey: "Dũng (2)|10" },
  { parentKey: "Nghị|9", childKey: "Vinh|10" },
  { parentKey: "Thịnh|9", childKey: "Huy|10" },
  { parentKey: "Thịnh|9", childKey: "Phúc (3)|10" },

  // Đời 10 → Đời 11
  { parentKey: "Hùng|10", childKey: "Hải|11" },
  { parentKey: "Thịnh|10", childKey: "Thủy|11" },
  { parentKey: "Thịnh|10", childKey: "Tuấn|11" },
  { parentKey: "Kha|10", childKey: "Khang|11" },
  { parentKey: "Khương|10", childKey: "Khoa|11" },
  { parentKey: "Nam|10", childKey: "Phước|11" },
  { parentKey: "Nam|10", childKey: "Lộc|11" },
  { parentKey: "Việt|10", childKey: "Khôi|11" },
  { parentKey: "Thư|10", childKey: "Khôi|11" },
  { parentKey: "Phúc|10", childKey: "Hải (2)|11" },
  { parentKey: "Linh (2)|10", childKey: "Hải (2)|11" },
  { parentKey: "Bình (2)|10", childKey: "Long|11" },
  { parentKey: "Bình (2)|10", childKey: "Dương|11" },
  { parentKey: "Quyết|10", childKey: "Quân|11" },
  { parentKey: "Diện|10", childKey: "Anh|11" },
  { parentKey: "Long (2)|10", childKey: "Hưng|11" },
  { parentKey: "Bộ|10", childKey: "Đức Phúc|11" },
  { parentKey: "Nguyên|10", childKey: "Đức Phúc|11" },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Mai Family Genealogy Seed Script ===");
  console.log(`Persons to insert: ${personsData.length}`);
  console.log(`Relationships to insert: ${relationshipsData.length}`);
  console.log();

  await db.transaction(async (tx) => {
    // 1. Truncate tables (idempotent)
    console.log("Truncating persons and relationships tables...");
    await tx.run(sql`TRUNCATE TABLE relationships CASCADE`);
    await tx.run(sql`TRUNCATE TABLE persons CASCADE`);
    console.log("Tables truncated.");

    // 2. Insert persons in batches of 50
    console.log("Inserting persons...");
    const BATCH_SIZE = 50;
    const nameToId = new Map<string, string>(); // "fullName|generation" → UUID

    for (let i = 0; i < personsData.length; i += BATCH_SIZE) {
      const batch = personsData.slice(i, i + BATCH_SIZE).map((p) => {
        const id = crypto.randomUUID();
        const key = `${p.fullName}|${p.generation}`;
        nameToId.set(key, id);
        return {
          id,
          fullName: p.fullName,
          gender: p.gender,
          generation: p.generation,
          isDeceased: true,
          isInLaw: false,
          ...(p.deathLunarDay != null ? { deathLunarDay: p.deathLunarDay } : {}),
          ...(p.deathLunarMonth != null ? { deathLunarMonth: p.deathLunarMonth } : {}),
          ...(p.note ? { note: p.note } : {}),
        };
      });

      await tx.insert(schema.persons).values(batch);
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} persons`);
    }

    // 3. Insert relationships using UUID map
    console.log("Inserting relationships...");
    const relValues = relationshipsData
      .map((r) => {
        const personA = nameToId.get(r.parentKey);
        const personB = nameToId.get(r.childKey);

        if (!personA) {
          console.error(`  WARNING: Parent not found for key "${r.parentKey}"`);
          return null;
        }
        if (!personB) {
          console.error(`  WARNING: Child not found for key "${r.childKey}"`);
          return null;
        }

        return {
          type: "biological_child" as const,
          personA,
          personB,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    for (let i = 0; i < relValues.length; i += BATCH_SIZE) {
      const batch = relValues.slice(i, i + BATCH_SIZE);
      await tx.insert(schema.relationships).values(batch);
      console.log(`  Inserted relationship batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} relationships`);
    }

    console.log();
    console.log("=== Seed Complete ===");
    console.log(`Total persons inserted: ${personsData.length}`);
    console.log(`Total relationships inserted: ${relValues.length}`);
    console.log(`Skipped relationships: ${relationshipsData.length - relValues.length}`);
  });

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
