# Mezzo

### Build & Run dev project

- Install all dependencies
  - `npm i`
- Run dev project
  - `npm run dev`

In development web runs on `http://localhost:4200/` while API runs on `http://localhost:8000/`

Idea is once packaged both run from same endponit.

This project was generated using [Nx](https://nx.dev).

# Building

The only non-intuitive piece during building vs development is in development the admin website and core APIs exist on two separate ports by 2 separate projects.
When building to publish to npm the web project is actually injected into the core project so that it is served by the same express server powering the core module.
This is done under the hood by the `nx prepare core` step powered bythe buildCoreWithWeb/impl file.
If changes are made to that file compile it `npx tsc tools/executors/buildCoreWithWeb/impl` via `npm run build:executor`. It may mention a couple tsc errors but confirm it compiles by running `git status` (the file `tools/executors/buildCoreWithWeb/impl.js` should be updated).

# Publishing

Run `npm publish dist/libs/core --access public` from the root of the project.

# Test

- Run tests
  - `npm test`

# Testing "Production" web experience

In development web runs on `http://localhost:4200/` while API runs on `http://localhost:8000/mezzo`.
There are some subtle differences in how things behave due to this. Here is how you can test this locally.

1. Run `npm run build:core:prod`
2. Navigate to `/dist/libs/core`
3. Run `npm i` (as it has dependencies on interfaces and constants)
   - TODO: Figure out better way to symlink or test node modules that aren't published or latest version is not yet published as all local mezzo dependencies point to npm (not local filesystem) when testing this way. Really only works for testing new content in core, not content in other packages without publishing every iteration (must be better way)
4. Start server by running `node src/index start`
   - If you want test data, install `cross-env` globally and run `cross-env USE_DUMMY_DATA=true node src/index.js start`
5. Load site at `http://localhost:8000/mezzo/`

## See dependency Graph

`nx dep-graph`
