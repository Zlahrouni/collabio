import { CurrencyFormatorPipe } from './currency-formator.pipe';

describe('CurrencyFormatorPipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyFormatorPipe();
    expect(pipe).toBeTruthy();
  });
});
