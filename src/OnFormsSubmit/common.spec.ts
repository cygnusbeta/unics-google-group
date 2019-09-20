import { format, getAllMemberKeysUsingIds } from './common';
import { SheetService } from '../sheet.service';

jest.unmock('./common');

describe('format(form)', () => {
  it('確認して登録します', () => {
    const str = '確認して登録します';
    const result = format(str);
    console.log(result);
    expect(result).toBe('登録');
  });

  it('確認してしまします', () => {
    const str = '確認してしまします';
    const result = format(str);
    console.log(result);
    expect(result).toBe('しま');
  });
});

it('getAllMemberKeysUsingIds(idsOnForm, sheet)', () => {
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
      'M1',
      '17NM0001A',
      '17S0001A',
      '理工学研究科',
      '水戸',
      '希望する'
    ]
  ];

  let sheet = new SheetService(undefined, valuesOnSheet);
  const idsOnForm = ['17NM0001A', '17S0001A', ''];
  let memberKeys: string[] = getAllMemberKeysUsingIds(idsOnForm, sheet);
  console.log(memberKeys);
  const expected = ['a-1@example.com', 'a-2@example.com'];
  expect(memberKeys).toStrictEqual(expected);
});
