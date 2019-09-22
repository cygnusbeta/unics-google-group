import { SpreadSheetService } from '../spreadSheet.service';
import { IdsService } from '../ids.service';
import { logVar } from '../logger';
import { formatError } from '../util';
import { SheetService } from '../sheet.service';
import { Email } from '../email';
import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { Member } from '../member';
import { Group } from '../group';

export const onGetGroupsFormSubmit = (e: FormsOnSubmit): void => {
  let bodyArray: string[] = ['────　スクリプトログ　─────'];
  let isErr: boolean = false;
  let errBodyArray = [];

  let ss: SpreadSheetService = new SpreadSheetService();
  let o = new GetGroups(e, ss);

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
  } catch (e) {
    isErr = true;
    bodyArray.push('エラー：学籍番号に対応するメールアドレスの取得に失敗しました。');
    errBodyArray.push(`エラー：学籍番号に対応するメールアドレスの取得に失敗しました。
${formatError(e)}`);
  }

  try {
    bodyArray.push('メール送信権限の取得処理');
    o.memberKeys.forEach((memberKey: string) => {
      let member = new Member(memberKey);
      let groupKeys = member.getGroupKeysBelongingTo();
      for (let groupKey of groupKeys) {
        let group = new Group();
        group.initUsingEmail(groupKey);
        let nowRole = member.getRoleIn(group);

        // - Google Group [2019 水戸] (unics_20xx_mito@googlegroups.com):
        //
        //   email@example.com: MEMBER
        //
        //   正常に取得しました。
        bodyArray.push(`- Google Group [${group.name}] (${group.groupKey}):

  ${memberKey}: ${nowRole}

  正常に取得しました。`);

        let nowRoleString = `メール送信権限${nowRole === 'MANAGER' ? 'あり' : 'なし'}`;
        // - Google Group [2019 水戸] (unics_20xx_mito@googlegroups.com):
        //
        //   email@example.com: メール送信権限なし

        // こちらはメールの先頭に追加
        bodyArray.unshift(`- Google Group [${group.name}] (${group.groupKey}):

  ${memberKey}: ${nowRoleString}`);
      }
    });
    bodyArray.push('正常に終了しました。');
  } catch (e) {
    isErr = true;
    bodyArray.push('エラー：メール送信権限の取得に失敗しました。');
    errBodyArray.push(`エラー：メール送信権限の取得に失敗しました。
${formatError(e)}`);
  }

  o.sendEmail(bodyArray, isErr, errBodyArray);
};

export class GetGroups {
  private name: string;
  private phonetic: string;
  public id: string;
  public id2: string;
  public id3: string;
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
      this.formType = e.namedValues['確認'][0];
    }
  }

  sendEmail(bodyArray: string[], isErr: boolean, errBodyArray: string[]): void {
    const tos = this.memberKeys;
    tos.forEach((to: string) => {
      if (isErr) {
        const sub = '【UNICS】【自動送信】参加済メーリングリスト一覧の取得（失敗）';

        //　下のメッセージは bodyArray の先頭に追加
        bodyArray.unshift(`${this.name} さん
  
  参加済メーリングリスト一覧の取得処理が何らかのエラー発生により正常に処理されませんでした。`);

        const email = new Email(to, sub, bodyArray, isErr, errBodyArray);
        email.send();
      } else {
        const sub = '【UNICS】【自動送信】参加済メーリングリスト一覧の取得処理完了';

        //　下のメッセージは bodyArray の先頭に追加
        bodyArray.unshift(`${this.name} さん
  
  参加済メーリングリスト一覧を取得しました。`);

        const email = new Email(to, sub, bodyArray);
        email.send();
      }
    });
  }
}
