import {
  DEFAULT_PORT,
  LOCAL_HOST,
  MEZZO_API_POST_RECORD_REQUEST,
  MEZZO_API_POST_RECORD_RESPONSE,
} from '@caribou-crew/mezzo-constants';
import { ServerConnectionOptions } from '@caribou-crew/mezzo-interfaces';
import * as R from 'ramda';
// import * as R from 'ramda/src/curry';
const { curry } = R;

function getConnectionFromOptions(options?: ServerConnectionOptions) {
  const protocol = options?.useHttps ? 'https' : 'http';
  const hostname = options?.hostname ?? LOCAL_HOST;
  const port = options?.port ?? DEFAULT_PORT;
  return `${protocol}://${hostname}:${port}`;
}

async function intercept(
  originalFetch,
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
  originalFetch(`${recordBaseUri}${MEZZO_API_POST_RECORD_REQUEST}`, {
    method: 'POST',
    body: JSON.stringify({
      resource,
      config,
    }),
  });

  // Request
  const response = await originalFetch(resource, config);

  // Response interceptor here
  console.log(`Resopnse intercept`, response);
  originalFetch(`${recordBaseUri}${MEZZO_API_POST_RECORD_RESPONSE}`, {
    method: 'POST',
    body: JSON.stringify({
      response,
    }),
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
