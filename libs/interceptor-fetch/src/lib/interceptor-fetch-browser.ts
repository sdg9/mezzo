// const { fetch: originalFetch } = window;
// import {
//   MEZZO_API_POST_RECORD_REQUEST,
//   MEZZO_API_POST_RECORD_RESPONSE,
// } from '@caribou-crew/mezzo-constants';
// export function interceptFetch() {
//   window.fetch = async (...args) => {
//     const [resource, config] = args;
//     // request interceptor here
//     console.log(`Request intercept resource: ${resource}, config: ${config}`);

//     // app.use(`${MEZZO_API_PATH}/record/request`, (req, res) => {
//     // TODO add port?
//     originalFetch(MEZZO_API_POST_RECORD_REQUEST, {
//       method: 'POST',
//       body: JSON.stringify({
//         resource,
//         config,
//       }),
//     });
//     const response = await originalFetch(resource, config);
//     // response interceptor here
//     console.log(`Resopnse intercept`, response);
//     originalFetch(MEZZO_API_POST_RECORD_RESPONSE, {
//       method: 'POST',
//       body: JSON.stringify({
//         response,
//       }),
//     });
//     return response;
//   };
// }
