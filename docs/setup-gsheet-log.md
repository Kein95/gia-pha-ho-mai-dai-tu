# Setup Google Sheet Edit Log

## 1. Tạo Google Sheet

- Tạo Google Sheet mới, đặt tên: `Gia Pha Mai - Edit Log`
- Sheet1 đặt header row 1: `Timestamp | UserId | UserEmail | Action | TargetType | TargetId | Detail | IP`

## 2. Thêm Apps Script

- Mở Sheet → **Extensions → Apps Script**
- Xóa code mặc định, paste:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.userId || '',
    data.userEmail || '',
    data.action || '',
    data.targetType || '',
    data.targetId || '',
    data.detail || '',
    data.ip || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Deploy

- Click **Deploy → New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Click **Deploy** → Copy URL

## 4. Set env var trên Vercel

```
GSHEET_WEBHOOK_URL = <URL từ bước 3>
```

## Lưu ý

- Webhook là fire-and-forget — lỗi GG Sheet không ảnh hưởng app
- Activity logs vẫn lưu DB kể cả khi không có `GSHEET_WEBHOOK_URL`
