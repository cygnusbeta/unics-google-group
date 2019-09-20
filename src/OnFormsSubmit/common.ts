import FormsOnSubmit = GoogleAppsScript.Events.FormsOnSubmit;
import { onRegistrationFormSubmit } from './registration';
import { Member } from '../member';
import { Group } from '../group';
import { SheetService } from '../sheet.service';

declare var global: any;

export const format = (str: string): string => {
  return str.replace(/^確認して((.(?!ます))*)します$/, '$1');
};

global.onFormSubmit = (e: FormsOnSubmit): void => {
  let form: string = e.namedValues['確認'][0];
  form = format(form);
  switch (form) {
    case '登録':
      onRegistrationFormSubmit(e);
      break;
  }
};

export const getAllMemberKeysUsingIds = (idsOnForm: string[], sheet: SheetService): string[] => {
  if (idsOnForm.length !== 3) {
    throw new Error('idsOnForm.length === 3 が予期されています。');
  }
  let ids: string[] = [];
  idsOnForm.forEach((id: string) => {
    if (id) ids.push(id);
  });

  const valuesOnSheet: string[][] = sheet.getValuesOnSheet();
  const lastRow: number = sheet.getLastRowIndex();

  const idColumnIndexes = [5, 6, 7];
  const memberKeyColumnIndex = 1;
  let memberKeys = new Set<string>();
  for (let idColumnIndex of idColumnIndexes) {
    for (let row = 0; row < lastRow + 1; row++) {
      if (ids.indexOf(valuesOnSheet[row][idColumnIndex]) != -1) {
        let memberKey = valuesOnSheet[row][memberKeyColumnIndex];
        memberKeys.add(memberKey);
      }
    }
  }
  return Array.from(memberKeys.values());
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
