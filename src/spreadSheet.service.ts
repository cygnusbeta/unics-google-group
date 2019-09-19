import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { SheetService } from './sheet.service';

export class SpreadSheetService {
  private ss: Spreadsheet;

  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  getSheet(sheetName: string): SheetService {
    let sheet: GoogleAppsScript.Spreadsheet.Sheet = this.ss.getSheetByName(sheetName);
    return new SheetService(sheet);
  }
}
