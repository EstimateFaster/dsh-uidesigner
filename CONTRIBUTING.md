# Contributing

Thanks for taking a look at `dsh-ui-designer`.

## Development

The project has no runtime dependencies, only Node.js 20+.

```sh
node build.mjs                  # regenerate lib/client.js, then syntax-check it
node --test test/host.test.mjs  # host tests
```

`lib/client.js` is generated from `src/client/*.js`. Edit the sources, run
`npm run build`, and commit the rebuilt bundle together with the source change;
CI fails if the committed bundle is stale.

The browser harness (`test/harness.html`) drives the real client bundle with a
mocked RPC layer:

```sh
google-chrome --headless=new --no-sandbox --allow-file-access-from-files \
  --user-data-dir=/tmp/dsh-uid-profile \
  --window-size=1440,1000 --virtual-time-budget=20000 \
  --dump-dom "file://$PWD/test/harness.html"
```

The `results` block at the bottom of the page lists each stage; `errors: none`
and `DONE` mean the flow passed.

## Design rules

- Components derive from `CONTROL`; only declare role / size keys, never font
  sizes, padding or radii. See `docs/design-tokens.md`.
- Colors, radii, shadows and fonts come from DSH tokens, never hard-coded
  values, so light and dark themes both work.
- Designs are plain JSON in the workspace; keep the schema in
  `docs/design-format.md` in sync with any node-field change.

## Pull requests

- Keep a PR focused; one behavior change per PR.
- Include the CLI output for `npm run build` and `node --test
  test/host.test.mjs`, and the harness `results` block for UI changes.
- Update `README.md` / `README.en.md` when user-facing behavior changes.
- New files should be MIT-compatible. Add third-party material to
  `THIRD-PARTY-NOTICES.md`.
