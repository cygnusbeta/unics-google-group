import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { Member } from '../member';
import { Group } from '../group';
import { getFormattedDate, getNowSchoolYear } from '../util';
import secret from '../secret';
import { logVar } from '../logger';
import { SpreadSheetService } from '../spreadSheet.service';
import { SheetService } from '../sheet.service';
import { getAllMemberKeysUsingIds, updateGroupsRoleSince2019 } from './common';
import { Email } from '../email';

export const onRegistrationFormSubmit = (e: FormsOnSubmit): void => {
  let bodyArray: string[] = ['────　スクリプトログ　─────'];
  let isErr: boolean = false;
  let errBodyArray = [];

  let ss: SpreadSheetService = new SpreadSheetService();
  let o = new Registration(e, ss);
  try {
    let member = new Member(o.email);
    let group = new Group();
    group.initUsingCampus(o.campus);
    member.addTo(group);
    bodyArray.push('メーリングリスト（Google グループ）へ追加しました。');
  } catch (e) {
    isErr = true;
    const body = 'エラー：メーリングリスト（Google グループ）への追加に失敗しました。';
    bodyArray.push(body);
    const errBody = `エラー：メーリングリスト（Google グループ）への追加に失敗しました。
getFormattedDate(): ${getFormattedDate()}
e.name: ${e.name}
e.lineNumber: ${e.lineNumber}
e.message: ${e.message}`;
    errBodyArray.push(errBody);
  }

  try {
    const newRole: 'MEMBER' | 'MANAGER' = this.permission === '希望する' ? 'MANAGER' : 'MEMBER';
    if (newRole === 'MANAGER') {
      // '希望する' にチェックをつけた人のみ、その人が入っている過去のメーリングリストに遡ってメール送信権限をつけにいく
      const idsOnForm: string[] = [this.id, this.id2, this.id3];
      const memberKeys: string[] = getAllMemberKeysUsingIds(idsOnForm, this.sheet);
      updateGroupsRoleSince2019(memberKeys, newRole);
    }
  } catch (e) {}

  o.add2SheetSeparate(ss);
  o.add2Contacts();
  o.sendEmail(bodyArray, isErr, errBodyArray);
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

  add2SheetSeparate(ss: SpreadSheetService): void {
    //　フォームへの回答を同じスプレッドシートの水戸と日立のタブ（シート）に振り分ける
    const values: string[][] = [
      [this.name, this.phonetic, this.year, this.id, this.department, this.campus as string]
    ];
    const sheetName = `${getNowSchoolYear()} ${this.campus}`;
    const row0Values: string[][] = [
      ['氏名', '氏名のふりがな', '学年', '学籍番号', '学部学科課程', '所属キャンパス']
    ];
    let sheetSeparate: SheetService = ss.getSheet(sheetName, true, row0Values);
    const lastRow = sheetSeparate.getLastRowIndex();
    this.sheet.getRange(lastRow + 1, 0, 1, values[0].length).setValues(values);
  }

  add2Contacts(): void {
    if (this.name == '' || this.email == '') return;

    let contact = ContactsApp.createContact('', this.name, this.email);
    let group = ContactsApp.getContactGroup(`${getNowSchoolYear()} ${this.campus}`);
    Logger.log(group);
    contact.addToGroup(group);
  }

  sendEmail(bodyArray: string[], isErr: boolean, errBodyArray: string[] = undefined): void {
    const to = this.email;
    const sub = '【UNICS】【自動送信】ご入会・所属継続ありがとうございます';

    //　下のメッセージは bodyArray の先頭に追加
    bodyArray.unshift(`${this.name} さん

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
よろしくお願いします。`);
    if (isErr) {
      const email = new Email(to, sub, bodyArray, isErr, errBodyArray);
      email.send();
    } else {
      const email = new Email(to, sub, bodyArray);
      email.send();
    }
  }
}
