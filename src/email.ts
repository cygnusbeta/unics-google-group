import secret from './secret';
import { logVars } from './logger';

export class Email {
  private to: string;
  private sub: string;
  private body: string;
  private htmlBody: string;
  private from: string;

  private isErr: boolean;
  private errTo: string;
  private errSub: string;
  private errBody: string;
  private errHtmlBody: string;
  private errFrom: string;

  constructor(
    to: string,
    sub: string,
    bodyArray: string[],
    isErr: boolean = false,
    errBodyArray: string[] = undefined
  ) {
    this.isErr = isErr;
    if (this.isErr && !errBodyArray) {
      const log4Vars = logVars({ to, sub, bodyArray, isErr });
      throw new Error(`isErr === true なのに errBodyArray が与えられていません

${log4Vars}`);
    }

    if (this.isErr) {
      bodyArray.push(
        '上記の一部処理でスクリプトに内部エラーが発生しています。この問題はスクリプトのメンテナーに自動で報告されました。現時点で何か対応する必要はありません。メンテナーが追って対応しますのでお待ちください。ご迷惑をおかけして申し訳ありません。'
      );
    } else {
      bodyArray.push('スクリプトは正常に終了しました。');
    }

    if (this.isErr) {
      errBodyArray.push('────　Execution transcript log　─────');
      errBodyArray.push(Logger.getLog());
      errBodyArray.push('────　フォーム回答者に送信されたメール　─────');
      errBodyArray.push(...bodyArray);

      this.errTo = secret.errTo;
      this.errSub = `エラー：${sub}`;
      for (let _errBody of errBodyArray) {
        _errBody.trim();
      }
      this.errBody = errBodyArray.join('\n\n');
      this.errHtmlBody = this.errBody.replace(/\n/g, '<br />');
      this.errFrom = `unics-google-group エラー <${secret.unicsEmail}>`;
    }

    this.to = to;
    this.sub = sub;

    for (let _body of bodyArray) {
      _body.trim();
    }

    // ['本文1', '本文2'] -> `本文1
    //
    // 本文2`
    this.body = bodyArray.join('\n\n');

    this.htmlBody = this.body.replace(/\n/g, '<br />');
    this.from = `UNICS <${secret.unicsEmail}>`;
  }

  send(): void {
    GmailApp.sendEmail(this.to, this.sub, this.body, { htmlBody: this.htmlBody, from: this.from });

    if (this.isErr) {
      GmailApp.sendEmail(this.errTo, this.errSub, this.errBody, {
        htmlBody: this.errHtmlBody,
        from: this.errFrom
      });
    }
  }
}
