import { format } from './common';

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
