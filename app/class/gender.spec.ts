import { Gender } from './gender';

describe('Gender', () => {
  it('should create an instance', () => {
    expect(new Gender(0, 0, 0, 0, 0, true)).toBeTruthy();
  });
});
