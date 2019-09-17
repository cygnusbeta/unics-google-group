import { Group } from './group';
import { UrlFetchService } from './urlFetch.service';
import { logVar, logVars } from './logger';

export class Member {
  private memberKey: string;

  constructor(email: string) {
    this.memberKey = email;
  }

  addTo(group: Group): void {
    this.confirmBelongToOrNotTo(group, false);

    //  POST a member information to https://www.googleapis.com/admin/directory/v1/groups/<groupKey>/members
    const url = `https://www.googleapis.com/admin/directory/v1/groups/${group.groupKey}/members`;
    const data = {
      email: this.memberKey,
      role: 'MEMBER'
    };
    const params = {
      method: 'post',
      contentType: 'application/json',
      // Convert the JavaScript object to a JSON string.
      payload: JSON.stringify(data)
    };
    let fetch = new UrlFetchService(url, params, 200, 'メンバーの追加に失敗しました。', {
      memberKey: this.memberKey,
      groupKey: group.groupKey
    });
    fetch.run();
  }

  deleteFrom(group: Group): void {
    this.confirmBelongToOrNotTo(group, true);

    //  DELETE a member information to https://www.googleapis.com/admin/directory/v1/groups/<groupKey>/members/<memberKey>
    const url = `https://www.googleapis.com/admin/directory/v1/groups/${group.groupKey}/members/${this.memberKey}`;
    const params = {
      method: 'delete'
    };
    let fetch = new UrlFetchService(url, params, 200, 'メンバーの削除に失敗しました。', {
      memberKey: this.memberKey,
      groupKey: group.groupKey
    });
    fetch.run();
  }

  getRoleIn(group: Group): 'MEMBER' | 'MANAGER' {
    this.confirmBelongToOrNotTo(group, true);

    //  与えられたメンバーの与えられたグループ上での現在のメール送信権限を取得する
    //  GET https://www.googleapis.com/admin/directory/v1/groups/<groupKey>/members/<memberKey>
    const url = `https://www.googleapis.com/admin/directory/v1/groups/${group.groupKey}/members/${this.memberKey}`;
    const params = {};
    let fetch = new UrlFetchService(
      url,
      params,
      200,
      `グループ (${group.groupKey}) での現在のメール送信権限の取得に失敗しました。`,
      {
        memberKey: this.memberKey,
        groupKey: group.groupKey
      }
    );
    fetch.run();
    const json: string = fetch.text;
    const data: object = JSON.parse(json);
    logVar({ data });
    const nowRole: 'MEMBER' | 'MANAGER' = data['role'];
    logVar({ nowRole });
    return nowRole;
  }

  updateRoleIn(group: Group, newRole: 'MEMBER' | 'MANAGER'): void {
    console.log(`グループ ${group.groupKey}`);
    const nowRole: 'MEMBER' | 'MANAGER' = this.getRoleIn(group);
    if (newRole === nowRole) {
      console.info(
        `グループ ${group.groupKey} は既に ${nowRole} になっているのでスキップしました。`
      );
      return;
    }

    //  PUT a new member information to https://www.googleapis.com/admin/directory/v1/groups/<groupKey>/members/<memberKey>
    const url = `https://www.googleapis.com/admin/directory/v1/groups/${group.groupKey}/members`;
    const data = {
      email: this.memberKey,
      role: newRole
    };
    const params = {
      method: 'put',
      contentType: 'application/json',
      // Convert the JavaScript object to a JSON string.
      payload: JSON.stringify(data)
    };
    let fetch = new UrlFetchService(url, params, 200, 'メンバーの送信権限の変更に失敗しました。', {
      memberKey: this.memberKey,
      groupKey: group.groupKey,
      nowRole,
      newRole
    });
    fetch.run();
  }

  isBelongTo(group: Group): boolean {
    group.confirmCreated({
      memberKey: this.memberKey,
      groupKey: group.groupKey
    });

    const groupGasObj = GroupsApp.getGroupByEmail(group.groupKey);
    return groupGasObj.hasUser(this.memberKey);
  }

  confirmBelongToOrNotTo(group: Group, expected: boolean): void {
    if (this.isBelongTo(group) !== expected) {
      const logOtherVars: string = logVars({
        memberKey: this.memberKey,
        groupKey: group.groupKey
      });

      let msg = '';
      if (expected) {
        msg = `メンバー ${this.memberKey} は、グループ ${group.groupKey} に属していません。属していないグループに対するそのメンバーの操作は「そのメンバーの追加」以外はできません。

${logOtherVars}`;
      } else {
        msg = `メンバー ${this.memberKey} は、グループ ${group.groupKey} に既に属しています。既に属しているグループにそのメンバーを新たに追加することはできません。

${logOtherVars}`;
      }

      throw new Error(msg);
    }
  }

  getGroupKeysBelongingTo(): string[] {
    // その memberKey（メールアドレス）が属しているグループ一覧を取得
    //  GET https://www.googleapis.com/admin/directory/v1/groups
    // ?query=[memberKey=<memberKey>]
    // [] 内は urlEncoded
    const query = `memberKey=${this.memberKey}`;
    const queryUrlEncorded: string = encodeURIComponent(query);
    const url = `https://www.googleapis.com/admin/directory/v1/groups?query=${queryUrlEncorded}`;
    const params = {};
    let fetch = new UrlFetchService(
      url,
      params,
      200,
      `メンバー (${this.memberKey}) の属しているグループ一覧の取得に失敗しました。`,
      {
        memberKey: this.memberKey
      }
    );
    fetch.run();
    const json: string = fetch.text;
    const data: object = JSON.parse(json);
    logVar({ data });
    const groupsResorce: object[] = data['groups'];
    let groupKeys: string[] = [];
    groupsResorce.forEach((groupResorce: object) => {
      let groupKey: string = groupResorce['email'];
      logVar({ groupKey });
      groupKeys.push(groupKey);
    });
    return groupKeys; // [a@googlegroups.com, b@googlegroups.com, ...]
  }
}
