import { AxiosError } from 'axios';
import { handleError, HSDPError } from './exceptions';

describe('exceptions', () => {
  it('throws generic error when no error is thrown can be found', () => {
    const e = 'Some error';
    expect(() => handleError(e)).toThrow(HSDPError);
  });

  it('throws generic error when no matching error can be found', () => {
    const e = new AxiosError('Test', '418');
    expect(() => handleError(e)).toThrow(HSDPError);
  });
});
