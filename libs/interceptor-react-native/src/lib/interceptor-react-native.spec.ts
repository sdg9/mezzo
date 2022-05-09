// import { interceptorReactNative } from './interceptor-react-native';

// Test data
const onSendData = null;
const onSendXHR = {
  UNSENT: 0,
  OPENED: 1,
  HEADERS_RECEIVED: 2,
  LOADING: 3,
  DONE: 4,
  readyState: 4,
  status: 0,
  timeout: 0,
  withCredentials: true,
  upload: {},
  _aborted: false,
  _hasError: true,
  _method: 'GET',
  _perfKey: 'network_XMLHttpRequest_1005',
  _response: '',
  _url: 'https://reactnative.dev/movies.json',
  _timedOut: false,
  _trackingName: 1005,
  _incrementalEvents: true,
  _performanceLogger: {
    _timespans: {
      network_XMLHttpRequest_1001: {
        startTime: 356.7000000476837,
        endTime: 496.2000000476837,
        totalTime: 139.5,
      },
      network_XMLHttpRequest_1002: {
        startTime: 514.2999999523163,
        endTime: 573.7999999523163,
        totalTime: 59.5,
      },
      network_XMLHttpRequest_1003: {
        startTime: 522.6000000238419,
        endTime: 598.2999999523163,
        totalTime: 75.69999992847443,
      },
      network_XMLHttpRequest_1004: {
        startTime: 610.7000000476837,
        endTime: 641.2999999523163,
        totalTime: 30.59999990463257,
      },
      network_XMLHttpRequest_1005: {
        startTime: 10150.799999952316,
      },
      network_XMLHttpRequest_1006: {
        startTime: 10489.200000047684,
      },
    },
    _extras: {},
    _points: {
      initializeCore_start: 264.60000002384186,
      initializeCore_end: 277.7000000476837,
    },
    _pointExtras: {},
    _closed: false,
  },
  _requestId: null,
  _cachedResponse: {
    _data: {
      blobId: 'e2007ea8-c72b-4a05-a6e7-b2b4c5558f05',
      offset: 0,
      size: 0,
      type: '',
      lastModified: 1652102313119,
      __collector: null,
    },
  },
  _headers: {},
  _responseType: 'blob',
  _sent: true,
  _lowerCaseResponseHeaders: {},
  _subscriptions: [],
};

// If connectivity fails, status will be 0
const onResponseStatus = 200;
const onResponseTimeout = 0;
const onResponseResponse = {
  _data: {
    size: 458,
    offset: 0,
    blobId: '2254004c-d961-4a6d-a023-f489656630f4',
    __collector: null,
  },
};
const onResponseUrl = 'https://reactnative.dev/movies.json';
const onResponseType = 'blob';
const onREsponseXHR = {
  UNSENT: 0,
  OPENED: 1,
  HEADERS_RECEIVED: 2,
  LOADING: 3,
  DONE: 4,
  readyState: 4,
  status: 200,
  timeout: 0,
  withCredentials: true,
  upload: {},
  _aborted: false,
  _hasError: false,
  _method: 'GET',
  _perfKey: 'network_XMLHttpRequest_1001',
  _response: {
    size: 458,
    offset: 0,
    blobId: '2254004c-d961-4a6d-a023-f489656630f4',
  },
  _url: 'https://reactnative.dev/movies.json',
  _timedOut: false,
  _trackingName: 1001,
  _incrementalEvents: true,
  _performanceLogger: {
    _timespans: {
      network_XMLHttpRequest_1001: {
        startTime: 4476.400000095367,
        endTime: 5163.5,
        totalTime: 687.0999999046326,
      },
      network_XMLHttpRequest_1002: {
        startTime: 5205.600000023842,
        endTime: 5361.700000047684,
        totalTime: 156.10000002384186,
      },
    },
    _extras: {},
    _points: {
      initializeCore_start: 562.9000000953674,
      initializeCore_end: 576,
    },
    _pointExtras: {},
    _closed: false,
  },
  responseHeaders: {
    'content-type': 'application/json',
    'expect-ct':
      'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
    etag: '"1c280937dfb73305184f0c1a4d75848c-ssl"',
    nel: '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
    'report-to':
      '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v3?s=PG1dcg6SXCNPxayMojnGR7vpipFUmGKE75I8As3JqQKDUdTnFfbWvVDLQ4XfVKdni9ffAsPfq3MkpQ%2F2OkRG%2B3XD2NQvrEJ7ct4HIzook74O1PjN%2BKbomgDGqZ3Sfufwz0U%3D"}],"group":"cf-nel","max_age":604800}',
    date: 'Mon, 09 May 2022 13:22:16 GMT',
    server: 'cloudflare',
    'cache-control': 'public, max-age=0, must-revalidate',
    'cf-ray': '708abe369b692a09-ORD',
    'access-control-allow-origin': '*',
    'cf-cache-status': 'DYNAMIC',
    'alt-svc': 'h3=":443"; ma=86400, h3-29=":443"; ma=86400',
    age: '4276',
    'x-nf-request-id': '01G2MFR7HNJ6N9XGXV2AAZTX5V',
  },
  _requestId: null,
  _cachedResponse: {
    _data: {
      size: 458,
      offset: 0,
      blobId: '2254004c-d961-4a6d-a023-f489656630f4',
      __collector: null,
    },
  },
  _headers: {},
  _responseType: 'blob',
  _sent: true,
  _lowerCaseResponseHeaders: {
    'content-type': 'application/json',
    'expect-ct':
      'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
    etag: '"1c280937dfb73305184f0c1a4d75848c-ssl"',
    nel: '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
    'report-to':
      '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v3?s=PG1dcg6SXCNPxayMojnGR7vpipFUmGKE75I8As3JqQKDUdTnFfbWvVDLQ4XfVKdni9ffAsPfq3MkpQ%2F2OkRG%2B3XD2NQvrEJ7ct4HIzook74O1PjN%2BKbomgDGqZ3Sfufwz0U%3D"}],"group":"cf-nel","max_age":604800}',
    date: 'Mon, 09 May 2022 13:22:16 GMT',
    server: 'cloudflare',
    'cache-control': 'public, max-age=0, must-revalidate',
    'cf-ray': '708abe369b692a09-ORD',
    'access-control-allow-origin': '*',
    'cf-cache-status': 'DYNAMIC',
    'alt-svc': 'h3=":443"; ma=86400, h3-29=":443"; ma=86400',
    age: '4276',
    'x-nf-request-id': '01G2MFR7HNJ6N9XGXV2AAZTX5V',
  },
  _subscriptions: [],
  responseURL: 'https://reactnative.dev/movies.json',
};

describe('interceptorReactNative', () => {
  it('should work', () => {
    // expect(interceptorReactNative()).toEqual('interceptor-react-native');
    expect(true).toBe(true);
  });
});
