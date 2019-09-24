import { logVar } from './logger';
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Range = GoogleAppsScript.Spreadsheet.Range;

export class SheetService {
  private sheet: Sheet;
  private valuesOnSheet: string[][];
  private test: boolean;
  private lastRow: number;

  constructor(sheet: Sheet, valuesOnSheet4Test: any[][] = undefined) {
    this.sheet = sheet;
    if (valuesOnSheet4Test) {
      this.valuesOnSheet = valuesOnSheet4Test as string[][];
      this.test = true;
    }
  }

  getValuesOnSheet(): string[][] {
    if (!(test && this.valuesOnSheet)) {
      this.valuesOnSheet = this.sheet.getDataRange().getValues() as string[][];
    }
    return this.valuesOnSheet;
  }

  getLastRowIndex(): number {
    if (!this.lastRow) {
      if (!this.valuesOnSheet) {
        this.valuesOnSheet = this.sheet.getDataRange().getValues();
      }

      let lastRow = 0;
      for (let j = 0; j < this.valuesOnSheet.length; j++) {
        if (this.valuesOnSheet[j][0] !== '') {
          lastRow = Math.max(lastRow, j);
        }
      }
      logVar({ lastRow });
      this.lastRow = lastRow;
    }
    return this.lastRow;
  }

  getRange(row: number, column: number, numRows: number, numColumns: number): Range {
    // row: Integer | The starting row index of the range; row indexing
    // starts with 0.
    // column: Integer | The starting column index of the range; column
    // indexing starts with 0.
    // numRows: Integer | The number of rows to return.
    // numColumns: Integer | The number of columns to return.
    return this.sheet.getRange(row + 1, column + 1, numRows, numColumns);
  }
}
