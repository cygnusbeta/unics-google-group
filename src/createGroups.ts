import { getNowSchoolYear } from './util';
import { Group } from './group';

function createGroups() {
  ['水戸', '日立'].forEach((campus: '水戸' | '日立') => {
    let group = new Group();
    group.initUsingCampus(campus, false);
    const groupKey = group.groupKey;
    group.create(`${getNowSchoolYear()} ${campus}`, { groupKey });
  });
}
