import { getNowSchoolYear } from './util';
import { logVar } from './logger';

export class Group {
  public groupKey: string;

  constructor() {}

  initUsingEmail(email: string) {
    if (this.groupKey) {
      const groupKey = this.groupKey;
      const errMsg = `この Group object は既に初期化されています。
最初の初期化時 ${logVar({ groupKey })}
2度目の初期化時 ${logVar({ email })}`;
      throw new Error(errMsg);
    }

    this.groupKey = email;
  }

  initUsingCampus(campus: '水戸' | '日立') {
    if (this.groupKey) {
      const groupKey = this.groupKey;
      const errMsg = `この Group object は既に初期化されています。
最初の初期化時 ${logVar({ groupKey })}
2度目の初期化時 ${logVar({ campus })}`;
      throw new Error(errMsg);
    }

    switch (campus) {
      case '水戸':
        this.groupKey = `unics_${getNowSchoolYear()}_mito@googlegroups.com`;
        break;

      case '日立':
        this.groupKey = `unics_${getNowSchoolYear()}_hitachi@googlegroups.com`;
        break;

      default:
        const errMsg = `グループの初期化に失敗しました。所属キャンパスの値が不正です。

${logVar({ campus })}`;
        throw new Error(errMsg);
    }
  }
}
