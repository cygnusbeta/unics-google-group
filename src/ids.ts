import { SheetService } from './sheet.service';

export class Ids {
  private allMemberKeys: string[];
  public rowsMatchedIds: number[];
  private ids: string[];
  public sheet: SheetService;
  private idColumnIndexes: number[];
  public memberKeyColumnIndex: number;

  constructor(idsOnForm: string[], sheet: SheetService) {
    if (idsOnForm.length !== 3) {
      throw new Error('idsOnForm.length === 3 が予期されています。');
    }
    this.ids = [];
    idsOnForm.forEach((id: string) => {
      if (id) this.ids.push(id);
    });

    this.sheet = sheet;

    this.idColumnIndexes = [5, 6, 7];
    this.memberKeyColumnIndex = 1;
  }

  getAllMemberKeys(): string[] {
    const valuesOnSheet: string[][] = this.sheet.getValuesOnSheet();
    const lastRow: number = this.sheet.getLastRowIndex();

    let memberKeys = new Set<string>();
    this.rowsMatchedIds = [];
    for (let idColumnIndex of this.idColumnIndexes) {
      for (let row = 0; row < lastRow + 1; row++) {
        if (this.ids.indexOf(valuesOnSheet[row][idColumnIndex]) != -1) {
          let memberKey = valuesOnSheet[row][this.memberKeyColumnIndex];
          memberKeys.add(memberKey);
          this.rowsMatchedIds.push(row);
        }
      }
    }
    this.allMemberKeys = Array.from(memberKeys.values());

    return this.allMemberKeys;
  }
}
