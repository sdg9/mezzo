# interceptor-fetch

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test interceptor-fetch` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint interceptor-fetch` to execute the lint via [ESLint](https://eslint.org/).

### Testing against RN Client locally

Couldn't get this working with npm, but with yarn run

`yarn add <rootDir>\mezzo\dist\libs\constants`

to react native project.

NPM looked fine, and on save auto updated (symlink?), but always errored out when running RN.

Yarn looks to copy files and not symlink but is functional. In this way I can edit in mezzo and see changes in RN as I'm not effectivley able to make a unit test
(lack of knowledge?) to show how RN fetch behaves with this intercpetor.
