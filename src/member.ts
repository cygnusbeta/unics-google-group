import { Group } from './group';
import { UrlFetchService } from './urlFetch.service';
import { logVar, logVars } from './logger';

export class Member {
  private memberKey: string;

  constructor(email: string) {
    this.memberKey = email;
  }

  addTo(group: Group) {
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
    const memberKey = this.memberKey;
    const groupKey = group.groupKey;
    let fetch = new UrlFetchService(url, params, 200, 'メンバーの追加に失敗しました。', {
      memberKey,
      groupKey
    });
    fetch.run();
  }

  deleteFrom(group: Group) {
    this.confirmBelongToOrNotTo(group, true);

    //  DELETE a member information to https://www.googleapis.com/admin/directory/v1/groups/<groupKey>/members/<memberKey>
    const url = `https://www.googleapis.com/admin/directory/v1/groups/${group.groupKey}/members/${this.memberKey}`;
    const params = {
      method: 'delete'
    };
    const memberKey = this.memberKey;
    const groupKey = group.groupKey;
    let fetch = new UrlFetchService(url, params, 200, 'メンバーの削除に失敗しました。', {
      memberKey,
      groupKey
    });
    fetch.run();
  }

  getRoleIn(group: Group) {
    this.confirmBelongToOrNotTo(group, true);

    //  与えられたメンバーの与えられたグループ上での現在のメール送信権限を取得する
    //  GET https://www.googleapis.com/admin/directory/v1/groups/<groupKey>/members/<memberKey>
    const url = `https://www.googleapis.com/admin/directory/v1/groups/${group.groupKey}/members/${this.memberKey}`;
    const params = {};
    const memberKey = this.memberKey;
    const groupKey = group.groupKey;
    let fetch = new UrlFetchService(
      url,
      params,
      200,
      `グループ (${group.groupKey}) での現在のメール送信権限の取得に失敗しました。`,
      {
        memberKey,
        groupKey
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

  updateRoleIn(group: Group, newRole: 'MEMBER' | 'MANAGER') {
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
    const memberKey = this.memberKey;
    const groupKey = group.groupKey;
    let fetch = new UrlFetchService(url, params, 200, 'メンバーの送信権限の変更に失敗しました。', {
      memberKey,
      groupKey,
      nowRole,
      newRole
    });
    fetch.run();
  }

  isBelongTo(group: Group) {
    const memberKey = this.memberKey;
    const groupKey = group.groupKey;
    group.confirmCreated({
      memberKey,
      groupKey
    });

    const groupGasObj = GroupsApp.getGroupByEmail(group.groupKey);
    return groupGasObj.hasUser(this.memberKey);
  }

  confirmBelongToOrNotTo(group: Group, expected: boolean) {
    if (this.isBelongTo(group) !== expected) {
      const memberKey = this.memberKey;
      const groupKey = group.groupKey;
      const logOtherVars: string = logVars({
        memberKey,
        groupKey
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

  getGroupsBelongingTo() {
    // その memberKey（メールアドレス）が属しているグループ一覧を取得
  }
}
