const logID = _uuid();

const LogLevelEnum = {
  ALL: "ALL",
  TRACE: "TRACE",
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  FATAL: "FATAL",
  OFF: "OFF",
};

const logData = {
  id: "",
  datetime: "",
  level: "",
  method: "",
  desc: "",
  postData: "",
  message: "",
};

function logWrite(data) {
  const sheetID = "sheetID";
  const spreadSheet = SpreadsheetApp.openById(sheetID);
  const sheet = spreadSheet.getSheetByName("log");
  const newRow = sheet.getLastRow() + 1;

  data.id = logID;

  const today = new Date();
  data.datetime = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}.${today.getMilliseconds()}`;

  var range = sheet.getRange(newRow, 1, 1, 7);
  range.setValues([[data.id, data.datetime, data.level, data.method, data.desc, data.postData, data.message]]);

  console.log(data);
}
