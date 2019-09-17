import { logVar } from './logger';
jest.unmock('./logger');

describe('logger', () => {
  it('logVar({ varName })', () => {
    const varName = 'value';
    expect(logVar({ varName })).toBe('varName: value');
  });
});
