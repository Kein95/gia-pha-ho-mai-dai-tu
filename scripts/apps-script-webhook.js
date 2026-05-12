function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'User ID',
      'User Email',
      'Action',
      'Target Type',
      'Target ID',
      'Detail',
      'IP Address'
    ]);
  }

  sheet.appendRow([
    data.timestamp,
    data.userId,
    data.userEmail,
    data.action,
    data.targetType || '',
    data.targetId || '',
    data.detail || '',
    data.ipAddress || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
