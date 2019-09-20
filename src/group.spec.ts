import { nameFromGroupKey } from './group';

jest.unmock('./group');

describe('nameFromGroupKey(groupKey)', () => {
  it('unics_2019_mito@googlegroups.com', () => {
    const groupKey = 'unics_2019_mito@googlegroups.com';
    const name = nameFromGroupKey(groupKey);
    console.log(name);
    expect(name).toBe('2019 水戸');
  });
  it('unics_2020_hitachi@googlegroups.com', () => {
    const groupKey = 'unics_2020_hitachi@googlegroups.com';
    const name = nameFromGroupKey(groupKey);
    console.log(name);
    expect(name).toBe('2020 日立');
  });
});
