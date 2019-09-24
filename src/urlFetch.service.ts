import { logVarL, logVars } from './logger';
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;
import OAuth2Service = GoogleAppsScriptOAuth2.OAuth2Service;
import { getOAuth2Service } from './oauth2';

export class UrlFetchService {
  private url: string;
  private params: object;
  private successResCode: number;
  private errMsg: string;
  private otherVars4Log: object;

  private log: string;
  public text: string;
  private oAuth2Service: OAuth2Service;

  constructor(
    url: string,
    params: object,
    successResCode: number,
    errMsg: string,
    otherVars4Log: object
  ) {
    this.url = url;
    this.params = params;
    this.successResCode = successResCode;
    this.errMsg = errMsg;
    this.otherVars4Log = otherVars4Log;
    this.log = '';

    this.oAuth2Service = getOAuth2Service();
    if (this.oAuth2Service === undefined) {
      const logOtherVars: string = logVars(this.otherVars4Log);
      const msg = `${this.errMsg}

urlFetch.service.ts において oAuth2Service === undefined となっています。認証し直してください。

        ${logOtherVars}`;
      throw new Error(msg);
    }
    this.params['headers'] = {
      Authorization: `Bearer ${this.oAuth2Service.getAccessToken()}`
    };

    this.params['muteHttpExceptions'] = true;
  }

  run(): void {
    const res: HTTPResponse = UrlFetchApp.fetch(this.url, this.params);
    const resCode: number = res.getResponseCode();
    this.log += logVarL({ resCode });
    const text: string = res.getContentText('UTF-8');
    this.log += logVarL({ text });
    this.text = text;

    if (resCode === this.successResCode) {
      this.throwErr();
    }

    this.oAuth2Service.reset();
  }

  throwErr(): void {
    const logOtherVars: string = logVars(this.otherVars4Log);
    this.log = this.log.trim();
    const msg = `${this.errMsg}

        ${this.log}
        ${logOtherVars}`;
    throw new Error(msg);
  }
}
