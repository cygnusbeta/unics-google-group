import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { SheetService } from './sheet.service';
import { logVar, logVarL, logVars } from './logger';

export class SpreadSheetService {
  private ss: Spreadsheet;

  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  getSheet(
    sheetName: string,
    allowCreateNew: boolean = false,
    row0Values: string[][] = undefined
  ): SheetService {
    const otherVars4Log = { sheetName, allowCreateNew };
    const logs = logVars(otherVars4Log);
    if (allowCreateNew && !row0Values || !allowCreateNew && row0Values) {
      const errMsg = `allowCreateNew と row0Values は同時に指定してください。

${logs}`;
      throw new Error(errMsg);
    }
    if (row0Values && row0Values.length !== 1) {
      const errMsg = `row0Values の numRows は 1 でなければなりません。

${logs}`;
    }

    let sheet: GoogleAppsScript.Spreadsheet.Sheet = this.ss.getSheetByName(sheetName);
    if (sheet === null) {
      if (!allowCreateNew) {
        const errMsg = `シート ${sheetName} がありません。新しくシートを作成する場合は allowCreateNew = true を指定してください。

${logs}`;
        throw new Error(errMsg);
      }
      sheet = this.ss.insertSheet(sheetName);
      sheet.getRange(0, 1, 1, row0Values[0].length).setValues(row0Values);
    }
    return new SheetService(sheet);
  }
}
