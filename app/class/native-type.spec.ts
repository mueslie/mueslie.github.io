import { NativeType } from './native-type';

describe('NativeType', () => {
  it('should create an instance', () => {
    expect(new NativeType('test', false)).toBeTruthy();
  });
});
