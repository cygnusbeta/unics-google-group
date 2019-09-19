import { SheetService } from '../sheet.service';
import { Registration } from './registration';

it('Array(5).fill(null).forEach((_, i) => {});', () => {
  let result = [];
  Array(5)
    .fill(null)
    .forEach((_, i) => {
      result.push(i);
    });
  console.log(result);
  expect(result).toStrictEqual([0, 1, 2, 3, 4]);
});

it('subarray', () => {
  const array = ['v1', 'v2', 'v3', 'v4', 'v5'];
  const indexes = [2, 3];
  let subarray: string[] = [];
  console.log(...indexes);
  indexes.map(v => {
    subarray.push(array[v]);
  });
  expect(subarray).toStrictEqual(['v3', 'v4']);
});

it('getAllMemberKeysUsingIds(ids4Test)', () => {
  // valuesOnSheet は実際の値を見ずに適当に書きました
  const valuesOnSheet: any[][] = [
    [
      '2018/09/30 2:27:35',
      'a-1@example.com',
      '狩野A子',
      'かのえいこ',
      'B1',
      '17S0001A',
      '',
      '理学部',
      '水戸',
      '希望する'
    ],
    [
      '2018/09/30 2:27:35',
      'b@example.com',
      '狩野B子',
      'かのびーこ',
      'B1',
      '17S0002B',
      '',
      '理学部',
      '水戸',
      '希望する'
    ],
    [
      '2018/09/30 2:27:35',
      'a-2@example.com',
      '狩野A子',
      'かのえいこ',
      'B1',
      '17NM0001A',
      '17S0001A',
      '理工学研究科',
      '水戸',
      '希望する'
    ]
  ];

  let sheet = new SheetService(undefined, valuesOnSheet);
  const ids4Test = ['17NM0001A', '17S0001A', ''];
  let registration = new Registration(undefined, sheet, true);
  let memberKeys: string[] = registration.getAllMemberKeysUsingIds(ids4Test);
  console.log(memberKeys);
  const expected = ['a-1@example.com', 'a-2@example.com'];
  expect(memberKeys).toStrictEqual(expected);
});
