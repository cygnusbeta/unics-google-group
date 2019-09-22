import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { SheetService } from '../sheet.service';
import { SpreadSheetService } from '../spreadSheet.service';
import { IdsService } from '../ids.service';
import { logVar } from '../logger';
import { formatError } from '../util';
import { updateGroupsRoleSince2019 } from './common';
import { Email } from '../email';

export const onChangePermissionFormSubmit = (e: FormsOnSubmit): void => {
  let bodyArray: string[] = ['────　スクリプトログ　─────'];
  let isErr: boolean = false;
  let errBodyArray = [];

  let ss: SpreadSheetService = new SpreadSheetService();
  let o = new ChangePermission(e, ss);

  const newRole: 'MEMBER' | 'MANAGER' = this.permission === '希望する' ? 'MANAGER' : 'MEMBER';
  // その人が入っている過去のメーリングリストに遡ってメール送信権限を変更していく
  const idsOnForm: string[] = [this.id, this.id2, this.id3];
  let ids = new IdsService(idsOnForm, this.sheet);
  try {
    o.memberKeys = ids.getAllMemberKeys();

    if (o.memberKeys.length === 0) {
      const idsString: string = ids.ids.join(', ');
      bodyArray.push(
        `エラー：学籍番号 (${idsString}) は${
          ids.ids.length >= 2 ? 'いずれも' : ''
        }登録されていません。学籍番号が間違っていないか確認してもう一度やり直してください。`
      );
      const errMsg = `エラー：学籍番号 (${idsString}) は${
        ids.ids.length >= 2 ? 'いずれも' : ''
      }登録されていません。学籍番号が間違っていないか確認してもう一度やり直してください。

${logVar({ id: this.id, id2: this.id2, id3: this.id3 })}`;
      throw new Error(errMsg);
    }

    let logArray4BodyArray = updateGroupsRoleSince2019(o.memberKeys, newRole);
    bodyArray.push(...logArray4BodyArray);
    bodyArray.push('メール送信権限を設定しました。');
  } catch (e) {
    isErr = true;
    bodyArray.push('エラー：メール送信権限の設定に失敗しました。');
    errBodyArray.push(`エラー：メール送信権限の設定に失敗しました。
${formatError(e)}`);
  }

  try {
    o.changeOnSS(ids);
    bodyArray.push('スプレッドシート上のメールアドレスを変更しました。');
  } catch (e) {
    isErr = true;
    bodyArray.push('エラー：スプレッドシート上のメールアドレスの変更に失敗しました。');
    errBodyArray.push(`エラー：スプレッドシート上のメールアドレスの変更に失敗しました。
${formatError(e)}`);
  }

  o.sendEmail(bodyArray, isErr, errBodyArray);
};

export class ChangePermission {
  private name: string;
  private phonetic: string;
  public id: string;
  public id2: string;
  public id3: string;
  private permission: '希望する' | '';
  private formType: string;

  private sheet: SheetService;
  private test: boolean;
  public memberKeys: string[];

  constructor(e: FormsOnSubmit, ss: SpreadSheetService, test: boolean = false) {
    this.sheet = ss.getSheet('registration');
    this.test = test;
    this.memberKeys = [];

    if (!this.test) {
      this.name = e.namedValues['氏名'][0];
      this.phonetic = e.namedValues['氏名のふりがな'][0];
      this.id = e.namedValues['学籍番号'][0];
      this.id2 = e.namedValues['前の学籍番号'][0];
      this.id3 = e.namedValues['前々の学籍番号'][0];
      this.permission = e.namedValues['メール送信権限'][0] as '希望する' | '';
      this.formType = e.namedValues['確認'][0];
    }
  }

  changeOnSS(ids: IdsService): void {
    const values: string[][] = [[this.permission]];
    ids.rowsMatchedIds.forEach((row: number) => {
      ids.sheet.getRange(row, ids.permissionColumnIndex, 1, 1).setValues(values);
    });
  }

  sendEmail(bodyArray: string[], isErr: boolean, errBodyArray: string[]): void {
    const tos = this.memberKeys;
    tos.forEach((to: string) => {
      if (isErr) {
        const sub = '【UNICS】【自動送信】メール送信権限の変更（失敗）';

        //　下のメッセージは bodyArray の先頭に追加
        bodyArray.unshift(`${this.name} さん
  
  メール送信権限の変更処理が何らかのエラー発生により正常に処理されませんでした。`);

        const email = new Email(to, sub, bodyArray, isErr, errBodyArray);
        email.send();
      } else {
        const sub = '【UNICS】【自動送信】メール送信権限の変更処理完了';

        //　下のメッセージは bodyArray の先頭に追加
        bodyArray.unshift(`${this.name} さん
  
  メール送信権限を変更しました。`);

        const email = new Email(to, sub, bodyArray);
        email.send();
      }
    });
  }
}
