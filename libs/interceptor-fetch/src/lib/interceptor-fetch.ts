import {
  DEFAULT_PORT,
  LOCAL_HOST,
  MEZZO_API_POST_RECORD_REQUEST,
  MEZZO_API_POST_RECORD_RESPONSE,
} from '@caribou-crew/mezzo-constants';
import { Fetch, ServerConnectionOptions } from '@caribou-crew/mezzo-interfaces';
import * as R from 'ramda';
// import { v4 as uuidv4 } from 'uuid';
// import * as R from 'ramda/src/curry';
const { curry } = R;

// function uuidv4() {
//   return (1e7 + '-' + 1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
//     (
//       c ^
//       (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
//     ).toString(16)
//   );
// }
function generateGuid() {
  let result, i, j;
  result = '';
  for (j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20) result = result + '-';
    i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
}

function getConnectionFromOptions(options?: ServerConnectionOptions) {
  const protocol = options?.useHttps ? 'https' : 'http';
  const hostname = options?.hostname ?? LOCAL_HOST;
  const port = options?.port ?? DEFAULT_PORT;
  return `${protocol}://${hostname}:${port}`;
}

async function intercept(
  originalFetch: Fetch,
  options: ServerConnectionOptions,
  resource: string,
  config: Record<string, any> = {}
) {
  // ...args
  const recordBaseUri = getConnectionFromOptions(options);

  // const [resource, config] = args;
  // const [config] = args;

  console.log('Options: ', options);
  console.log('Resource: ', resource);

  console.log(
    'about to fetch',
    `${recordBaseUri}${MEZZO_API_POST_RECORD_REQUEST}`
  );

  // Request interceptor here
  const startTime = new Date().getTime();
  // const uuid = uuidv4();
  const uuid = generateGuid();
  originalFetch(`${recordBaseUri}${MEZZO_API_POST_RECORD_REQUEST}`, {
    method: 'POST',
    body: JSON.stringify({
      uuid,
      resource,
      config,
      startTime,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request
  const response = await originalFetch(resource, config);
  const endTime = new Date().getTime();
  const responseJson = await response.clone().json();

  // Response interceptor here
  console.log('Total response: ', response);
  console.log(`Resopnse intercept`, JSON.stringify(responseJson));
  originalFetch(`${recordBaseUri}${MEZZO_API_POST_RECORD_RESPONSE}`, {
    method: 'POST',
    body: JSON.stringify({
      uuid,
      endTime,
      duration: endTime - startTime,
      body: responseJson,
      // origBody: response.body,
      // origBody2: response.blob(),
      headers: response.headers,
      status: response.status,
      // response: response,
      redirected: response.redirected,
      statusText: response.statusText,
      type: response.type,
      url: response.url,
      // all: { ...response },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export const interceptedFetch = curry(intercept);

// export const interceptedFetch = curry(intercept);

// export function interceptorFetch(): string {
//   return 'interceptor-fetch';
// }

// let interceptors = []`

// function interceptor(fetch, ...args) {
//   const reversedInterceptors = interceptors.reduce(
//     (array, interceptor) => [interceptor].concat(array),
//     []
//   );
//   let promise = Promise.resolve(args);

//   // Register request interceptors
//   reversedInterceptors.forEach(({ request, requestError }) => {
//     if (request || requestError) {
//       promise = promise.then((args) => request(...args), requestError);
//     }
//   });

//   // Register fetch call
//   // promise = promise.then((args: any) => {
//   //   console.log('Args: ', args);
//   //   return Promise.resolve('Hi');
//   //   // const request = new Request(...args);
//   //   // return fetch(request)
//   //   //   .then((response) => {
//   //   //     response.request = request;
//   //   //     return response;
//   //   //   })
//   //   //   .catch((error) => {
//   //   //     error.request = request;
//   //   //     return Promise.reject(error);
//   //   //   });
//   // });

//   // Register response interceptors
//   reversedInterceptors.forEach(({ response, responseError }) => {
//     if (response || responseError) {
//       promise = promise.then(response, responseError);
//     }
//   });

//   return promise;
// }

// export default function attach(env) {
//   // Make sure fetch is available in the given environment
//   if (!env.fetch) {
//     try {
//       require('whatwg-fetch');
//     } catch (err) {
//       throw Error('No fetch available. Unable to register fetch-intercept');
//     }
//   }
//   env.fetch = (function (fetch) {
//     return function (...args) {
//       return interceptor(fetch, ...args);
//     };
//   })(env.fetch);

//   return {
//     register: function (interceptor) {
//       interceptors.push(interceptor);
//       return () => {
//         const index = interceptors.indexOf(interceptor);
//         if (index >= 0) {
//           interceptors.splice(index, 1);
//         }
//       };
//     },
//     clear: function () {
//       interceptors = [];
//     },
//   };
// }
