/**
 * There may be a better way to handle this, but this way each test that runs in parallel
 * can use a different port when spinning up a real mezzo server to avoid collision
 */
export const adminEndpointsPort = 3001;
export const corePort = 3002;
export const redirectPort = 3003;
export const routeExpressPort = 3004;
export const fileIOPort = 3005;
export const routeStatePort = 3006;
export const recordingServerPort = 3007;
