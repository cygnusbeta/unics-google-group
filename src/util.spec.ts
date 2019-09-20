import { getFormattedDate, getNowSchoolYear } from './util';
jest.unmock('./util');

describe('util', () => {
  describe('getNowSchoolYear()', () => {
    it('2019-10-01', () => {
      const date = new Date('2019-10-01');
      expect(getNowSchoolYear(date)).toBe(2019);
    });
    it('2020-03-01', () => {
      const date = new Date('2020-03-01');
      expect(getNowSchoolYear(date)).toBe(2019);
    });
    it('2020-04-01', () => {
      const date = new Date('2020-04-01');
      expect(getNowSchoolYear(date)).toBe(2020);
    });
  });

  describe('getFormattedDate()', () => {
    it('(now)', () => {
      const date = new Date();
      const result = getFormattedDate(date);
      console.log(result);
    });
    it('2019-10-01 08:00:00', () => {
      const date = new Date('2019-10-01 08:00:00');
      expect(getFormattedDate(date)).toBe('2019/10/01[TUE] 08:00:00');
    });
  });
});
