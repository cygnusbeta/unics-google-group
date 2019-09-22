import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { onRegistrationFormSubmit } from './registration';
import { Member } from '../member';
import { Group } from '../group';
import { onChangeEmailFormSubmit } from './changeEmail';
import { logVar } from '../logger';

declare var global: any;

export const format = (str: string): string => {
  return str.replace(/^確認して((.(?!ます))*)します$/, '$1');
};

global.onFormSubmit = (e: FormsOnSubmit): void => {
  let formType: string = e.namedValues['確認'][0];
  formType = format(formType);
  switch (formType) {
    case '登録':
      onRegistrationFormSubmit(e);
      break;
    case 'メールアドレスを変更':
      onChangeEmailFormSubmit(e);
      break;
    default:
      const errMsg = `該当のフォームがありません

${logVar({ formType })}`;
      throw new Error(errMsg);
  }
};

export const updateGroupsRoleSince2019 = (
  memberKeys: string[],
  newRole: 'MEMBER' | 'MANAGER'
): void => {
  // 2019 年度からの全てのメーリングリストの送信権限を更新する。
  // 引数：学籍番号に対応する複数のメールアドレス → それが属するグループ全てに対して権限を更新
  memberKeys.forEach((memberKey: string) => {
    let member = new Member(memberKey);
    let groupKeys = member.getGroupKeysBelongingTo();
    for (let groupKey of groupKeys) {
      let group = new Group();
      group.initUsingEmail(groupKey);
      if (member.getRoleIn(group) !== newRole) {
        member.updateRoleIn(group, newRole);
      }
    }
  });
};
