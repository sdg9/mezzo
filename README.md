# Mezzo

Run dev project `npm run dev`

In development web runs on `http://localhost:4200/` while API runs on `http://localhost:8000/`

Idea is once packaged both run from same endponit.

This project was generated using [Nx](https://nx.dev).

# Building

- `npm run build`
  - Builds admin web and core projects
- `nx prepare core`
  - Injects admin web output into core.
  - While not wired up at some point this way mezzo can serve the site while also serving the mock API
  - Be sure any changes are built before you run `npm build:executor` aka `npx tsc tools/executors/buildCoreWithWeb/impl`

# Publishing

Run `npm publish dist/libs/core --access public` from the root of the project

# Other Commands

- Run dev api and web
  - `npm run dev`
- Run tests for api
  - `nx test core`
- Serve only api
  - `nx serve core`
- Build the projects
  - `npm run build`
