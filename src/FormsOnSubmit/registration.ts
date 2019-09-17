import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;

class Registration {
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

  constructor(e: FormsOnSubmit) {
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
