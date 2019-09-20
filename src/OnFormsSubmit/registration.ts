import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { Member } from '../member';
import { Group } from '../group';
import { getNowSchoolYear } from '../util';
import secret from '../secret';
import { logVar } from '../logger';
import { SpreadSheetService } from '../spreadSheet.service';
import { SheetService } from '../sheet.service';

export const onRegistrationFormSubmit = (e: FormsOnSubmit): void => {
  const o = new Registration(e);
  let member = new Member(o.email);
  let group = new Group();
  group.initUsingCampus(o.campus);
  member.addTo(group);
  o.updateGroupsRoleSince2019();

  o.add2SS();
  o.add2Contacts();
  o.sendDiscordInvitation();
};

export class Registration {
  public email: string;
  public name: string;
  public phonetic: string;
  public year: string;
  public id: string;
  public id2: string;
  public id3: string;
  public department: string;
  public campus: '水戸' | '日立';
  public permission: '希望する' | '';
  private sheet: SheetService;
  private test: boolean;

  constructor(
    e: FormsOnSubmit,
    sheet: SheetService = new SpreadSheetService().getSheet('registration'),
    test: boolean = false
  ) {
    this.sheet = sheet;
    this.test = test;
    if (!this.test) {
      this.email = e.namedValues['メールアドレス'][0];
      this.name = e.namedValues['氏名'][0];
      this.phonetic = e.namedValues['氏名のふりがな'][0];
      this.year = e.namedValues['学年'][0];
      this.id = e.namedValues['学籍番号'][0];
      this.id2 = e.namedValues['前の学籍番号'][0];
      this.id3 = e.namedValues['前々の学籍番号'][0];
      this.department = e.namedValues['学部学科課程'][0];
      this.campus = e.namedValues['所属キャンパス'][0] as '水戸' | '日立';
      this.permission = e.namedValues['メール送信権限'][0] as '希望する' | '';
    }
  }

  updateGroupsRoleSince2019(): void {
    // 2019 年度からの全てのメーリングリストの送信権限を更新する。
    // 学籍番号が属しているメーリングリスト一覧を取得 → それ全てに対して権限を更新
  }

  add2SS(): void {
    //　フォームへの回答を同じスプレッドシートの水戸と日立のタブに振り分ける
  }

  add2Contacts(): void {
    if (this.name == '' || this.email == '') return;

    let contact = ContactsApp.createContact('', this.name, this.email);
    let group = ContactsApp.getContactGroup(`${getNowSchoolYear()} ${this.campus}`);
    Logger.log(group);
    contact.addToGroup(group);
  }

  sendDiscordInvitation(): void {
    const name = this.name;
    logVar({ name });
    const email = this.email;
    logVar({ email });
    if (this.name == '' || this.email == '') return;

    const sub = '【UNICS】【自動送信】ご入会・所属継続ありがとうございます';
    let body = `${this.name} さん

UNICS へのご入会・所属継続、ありがとうございます。
このメールは ${getNowSchoolYear()}年度 PC サークル UNICS 入会・所属継続用フォーム ≪Google グループ対応版≫ へ回答された方に自動で送信されています。

＜メーリングリスト追加について＞
ご回答いただいたメールアドレスを、UNICS ${
      this.campus
    } ${getNowSchoolYear()}年度のメーリングリスト（Google グループ）に追加しました。

＜Discord について＞
UNICS ではチャットツールに Discord を使用しています。招待リンクをお送りしますので、まだ登録していない方は、ここからご登録ください。

${secret.discordLink}

その際、登録後にニックネームを分かりやすい名前に変更してください。
例：「茨城太郎 / B1 情報工」
（ちなみに B1 というのは学部一年という意味です。）

何か質問等ある場合には UNICS へ HP、Twitter、または、Discord よりお問い合わせ下さい。
よろしくお願いします。`;

    body = body.trim();
    const htmlBody = body.replace(/\n/g, '<br />');
    const from = `UNICS <${secret.unicsEmail}>`;
    GmailApp.sendEmail(this.email, sub, body, { htmlBody: htmlBody, from: from });
  }

  getAllMemberKeysUsingIds(ids4Test: string[] = undefined): string[] {
    if ((ids4Test && !this.test) || (!ids4Test && this.test)) {
      throw new Error(
        'this.test と ids4Test でテストなのかテストじゃないのかが食い違っています。どちらかに統一してください。'
      );
    }
    if (ids4Test.length !== 3) {
      throw new Error('ids4test.length === 3 が予期されています。');
    }
    if (ids4Test) {
      this.id = ids4Test[0];
      this.id2 = ids4Test[1];
      this.id3 = ids4Test[2];
    }

    let ids: string[] = [];
    [this.id, this.id2, this.id3].forEach((id: string) => {
      if (id) ids.push(id);
    });

    const valuesOnSheet: string[][] = this.sheet.getValuesOnSheet();
    const lastRow: number = this.sheet.getLastRowIndex();

    const idColumnIndexes = [5, 6, 7];
    const memberKeyColumnIndex = 1;
    let memberKeys = new Set<string>();
    for (let idColumnIndex of idColumnIndexes) {
      for (let row = 0; row < lastRow + 1; row++) {
        if (ids.indexOf(valuesOnSheet[row][idColumnIndex]) != -1) {
          let memberKey = valuesOnSheet[row][memberKeyColumnIndex];
          memberKeys.add(memberKey);
        }
      }
    }
    return Array.from(memberKeys.values());
  }

  getAllGroupKeysUsingMemberKeys(memberKeys: string[]): string[] {
    let groupKeys: string[] = [];
    memberKeys.forEach((memberKey: string) => {
      let member = new Member(memberKey);
      groupKeys.push(...member.getGroupKeysBelongingTo());
    });

    return groupKeys;
  }
}
