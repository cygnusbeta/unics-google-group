export class DiscordService {
  sendMessage(message: string, webhookUrl: string, username: string = ''): void {
    //  一度に 2000 字までしか投稿できないので、2000字毎に分割する。（念の為1990文字）
    let allowedLength = 1990;

    let shortMsgs = this.splitMsg(message, allowedLength);

    for (let m = 0; m < shortMsgs.length; m++) {
      let shortMsg = shortMsgs[m];
      let obj = {
        content: '',
        username: ''
      };
      obj.content = shortMsg;
      if (username != '') {
        //      username は 80 文字まで
        if (username.length <= 80) {
          obj.username = username.slice(0, 80);
        } else {
          obj.username = username.slice(0, 77) + '...';
        }
      }
      let payload = JSON.stringify(obj);

      let params = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST' as 'get' | 'delete' | 'patch' | 'post' | 'put',
        payload: payload
        //    muteHttpExceptions: true
      };

      let res = UrlFetchApp.fetch(webhookUrl, params);
      Logger.log(res.getContentText());
    }
  }
  //
  //// to call and send a message
  //sendMessage("Hi!", "test");

  splitMsg(message: string, allowedLength: number): string[] {
    //  1ラインがそもそも2000字超えてないかチェック
    let isCannotSplitByLine = false;
    let lines = message.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.length > allowedLength) {
        isCannotSplitByLine = true;
        break;
      }
    }

    let shortMsgs: string[] = [];
    if (isCannotSplitByLine) {
      //    ないと思うけど1ラインがそもそも2000字超えてたら行で2000字以下に分割できないので、そのときは文字数でぶちぎる
      for (let i = 0; i < message.length; i += allowedLength) {
        shortMsgs.push(message.substring(i, i + allowedLength));
      }
    } else {
      //    2000字を超えない最大文字数の段落で配列に分割
      let _shortMsg = '';
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        let ConcatenatedShortMsg = _shortMsg + '\n' + line;
        if (ConcatenatedShortMsg.length > allowedLength) {
          shortMsgs.push(_shortMsg);
          _shortMsg = '';
        }
        _shortMsg += '\n' + line;
      }
      shortMsgs.push(_shortMsg);
    }

    return shortMsgs;
  }
}
