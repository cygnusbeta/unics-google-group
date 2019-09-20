import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { Member } from '../member';
import { Group } from '../group';
import { getNowSchoolYear } from '../util';
import secret from '../secret';
import { logVar } from '../logger';
import { SpreadSheetService } from '../spreadSheet.service';
import { SheetService } from '../sheet.service';
import { getAllMemberKeysUsingIds, updateGroupsRoleSince2019 } from './common';

export const onRegistrationFormSubmit = (e: FormsOnSubmit): void => {
  let ss: SpreadSheetService = new SpreadSheetService();
  let o = new Registration(e, ss);
  let member = new Member(o.email);
  let group = new Group();
  group.initUsingCampus(o.campus);
  member.addTo(group);

  const idsOnForm: string[] = [this.id, this.id2, this.id3];
  const memberKeys: string[] = getAllMemberKeysUsingIds(idsOnForm, this.sheet);
  const newRole: 'MEMBER' | 'MANAGER' = this.permission === '希望する' ? 'MANAGER' : 'MEMBER';
  updateGroupsRoleSince2019(memberKeys, newRole);

  o.add2SS(ss);
  o.add2Contacts();
  o.sendDiscordInvitation();
};

export class Registration {
  public email: string;
  private name: string;
  private phonetic: string;
  private year: string;
  public id: string;
  public id2: string;
  public id3: string;
  private department: string;
  public campus: '水戸' | '日立';
  public permission: '希望する' | '';
  private formType: string;
  private sheet: SheetService;
  private test: boolean;

  constructor(e: FormsOnSubmit, ss: SpreadSheetService, test: boolean = false) {
    this.sheet = ss.getSheet('registration');
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
      this.formType = e.namedValues['確認'][0];
    }
  }

  add2SS(ss: SpreadSheetService): void {
    //　フォームへの回答を同じスプレッドシートの水戸と日立のタブ（シート）に振り分ける
    const values: string[][] = [
      [
        this.email,
        this.name,
        this.phonetic,
        this.year,
        this.id,
        this.id2,
        this.id3,
        this.department,
        this.campus as string,
        this.permission as string,
        this.formType
      ]
    ];
    const sheetName = `${getNowSchoolYear()} ${this.campus}`;
    const row0Values: string[][] = [
      [
        'メールアドレス',
        '氏名',
        '氏名のふりがな',
        '学年',
        '学籍番号',
        '前の学籍番号',
        '前々の学籍番号',
        '学部学科課程',
        '所属キャンパス',
        'メール送信権限',
        '確認'
      ]
    ];
    let sheetSeparate: SheetService = ss.getSheet(sheetName, true, row0Values);
    const lastRow = sheetSeparate.getLastRowIndex();
    this.sheet.getRange(lastRow + 1, 1, 1, values[0].length).setValues(values);
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
}
