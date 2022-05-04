import { interceptorFetch } from './interceptor-fetch';

describe('interceptorFetch', () => {
  it('should work', () => {
    expect(interceptorFetch()).toEqual('interceptor-fetch');
  });
});
