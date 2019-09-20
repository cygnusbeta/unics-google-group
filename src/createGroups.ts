import { getNowSchoolYear } from './util';
import { Group } from './group';

function createGroups() {
  ['水戸', '日立'].forEach((campus: '水戸' | '日立') => {
    let group = new Group();
    group.initUsingCampus(getNowSchoolYear(), campus, false);
    group.create({ groupKey: group.groupKey });
  });
}
