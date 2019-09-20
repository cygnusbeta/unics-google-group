import { logVar, logVars } from './logger';
import { UrlFetchService } from './urlFetch.service';
import { sleep } from './util';

export const nameFromGroupKey = (groupKey: string): string => {
  const campusAlphabet = groupKey.replace(/unics_[0-9]{4}_(.*)@googlegroups\.com/, '$1');
  let campus: '水戸' | '日立';
  if (campusAlphabet === 'mito') {
    campus = '水戸';
  } else if (campusAlphabet === 'hitachi') {
    campus = '日立';
  } else {
    const errMsg = `groupKey が水戸のメールアドレスでも日立のものでもなく不正です。あるいは campusAlphabet の正規表現が間違っている可能性もあります。
${logVar({ groupKey: this.groupKey })}`;
    throw new Error(errMsg);
  }
  const schoolYear = groupKey.replace(/unics_([0-9]{4})_.*@googlegroups\.com/, '$1');
  return `${schoolYear} ${campus}`;
};

export class Group {
  public groupKey: string;
  public created: boolean;
  public name: string;

  constructor() {}

  initUsingEmail(email: string, created: boolean = true) {
    if (this.groupKey) {
      const errMsg = `この Group object は既に初期化されています。
最初の初期化時 ${logVar({ groupKey: this.groupKey })}
2度目の初期化時 ${logVar({ email })}`;
      throw new Error(errMsg);
    }

    this.groupKey = email;
    this.name = nameFromGroupKey(this.groupKey);
    this.created = this.isCreated();
  }

  initUsingCampus(schoolYear: number, campus: '水戸' | '日立', created: boolean = true): void {
    if (this.groupKey) {
      const errMsg = `この Group object は既に初期化されています。
最初の初期化時 ${logVar({ groupKey: this.groupKey })}
2度目の初期化時 ${logVar({ campus })}`;
      throw new Error(errMsg);
    }

    switch (campus) {
      case '水戸':
        this.groupKey = `unics_${schoolYear}_mito@googlegroups.com`;
        break;

      case '日立':
        this.groupKey = `unics_${schoolYear}_hitachi@googlegroups.com`;
        break;

      default:
        const errMsg = `グループの初期化に失敗しました。所属キャンパスの値が不正です。

${logVar({ campus })}`;
        throw new Error(errMsg);
    }

    this.name = `${schoolYear} ${campus}`;
    this.created = this.isCreated();
  }

  isCreated(): boolean {
    try {
      GroupsApp.getGroupByEmail(this.groupKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  create(otherVars4Log: object): void {
    if (this.created === true) {
      const logOtherVars: string = logVars(otherVars4Log);
      const msg = `グループ ${this.groupKey} は既に作成されています。既に作成されているグループを新規作成することはできません。

${logOtherVars}`;
      throw new Error(msg);
    }

    //  POST group information to https://www.googleapis.com/admin/directory/v1/groups
    const url = 'https://www.googleapis.com/admin/directory/v1/groups';
    const data = {
      email: this.groupKey,
      name: this.name,
      description: `UNICS ${this.name}`
    };
    const params = {
      method: 'post',
      contentType: 'application/json',
      // Convert the JavaScript object to a JSON string.
      payload: JSON.stringify(data)
    };

    let fetch = new UrlFetchService(
      url,
      params,
      201,
      `新しいメーリングリスト ${this.name} の作成に失敗しました。`,
      {
        groupKey: this.groupKey
      }
    );
    fetch.run();

    sleep(5);

    this.created = this.isCreated();
  }

  confirmCreated(otherVars4Log: object): void {
    // グループが既に作成されているかどうかは初期化時に確認済みなので、ここでは this.created ===
    // true のときは this.isCreated を参照しない。（this.created ===
    // false のときは念の為もう一度確認する。依然として false が帰ってきたらエラーを吐く。）
    if (!this.created && !this.isCreated()) {
      this.create(otherVars4Log);
      //       const logOtherVars: string = logVars(otherVars4Log);
      //       const msg = `グループ ${this.groupKey} はまだ作成されていません。作成されていないグループのメンバー操作はできません。
      //
      // ${logOtherVars}`;
      //       throw new Error(msg);
    }
  }
}
