import { SheetService } from './sheet.service';

export class IdsService {
  private allMemberKeys: string[];
  public rowsMatchedIds: number[];
  public ids: string[];
  public sheet: SheetService;
  private idColumnIndexes: number[];
  public memberKeyColumnIndex: number;
  public permissionColumnIndex: number;

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
    this.permissionColumnIndex = 10;
  }

  getAllMemberKeys(): string[] {
    const valuesOnSheet: string[][] = this.sheet.getValuesOnSheet();
    const lastRow: number = this.sheet.getLastRowIndex();

    let memberKeysSet = new Set<string>();
    let rowsMatchedIdsSet = new Set<number>();

    for (let idColumnIndex of this.idColumnIndexes) {
      for (let row = 0; row < lastRow + 1; row++) {
        if (this.ids.indexOf(valuesOnSheet[row][idColumnIndex]) != -1) {
          let memberKey = valuesOnSheet[row][this.memberKeyColumnIndex];
          memberKeysSet.add(memberKey);
          rowsMatchedIdsSet.add(row);
        }
      }
    }
    this.allMemberKeys = Array.from(memberKeysSet.values());
    this.rowsMatchedIds = Array.from(rowsMatchedIdsSet.values());

    return this.allMemberKeys;
  }
}
