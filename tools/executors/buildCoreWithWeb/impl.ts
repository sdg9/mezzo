// npx tsc tools/executors/buildCoreWithWeb/impl

import { ExecutorContext, runExecutor } from '@nrwl/devkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

export interface ExecutorOptions {}

/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

export default async function echoExecutor(
  options: ExecutorOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  console.log('Running executor 1');
  console.log('Options: ', options);

  const buildClient = await runExecutor(
    { project: 'admin-web', target: 'build' },
    options,
    context
  );

  for await (const result of buildClient) {
    if (!result.success) {
      return result;
    }
  }

  const buildLib = await runExecutor(
    { project: 'core', target: 'build' },
    {},
    context
  );

  for await (const result of buildLib) {
    if (!result.success) {
      return result;
    }
  }

  copyRecursiveSync(
    './dist/apps/admin-web',
    './dist/libs/core/src/public' // TODO this may have to change based on how app is built
  );

  return { success: true };
}
