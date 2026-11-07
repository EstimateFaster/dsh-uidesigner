# Third-party notices

`dsh-ui-designer` itself is MIT licensed (see [`LICENSE`](LICENSE)). The
following third-party material is included in this repository.

## React / React DOM

- Files: `test/vendor/react.production.min.js`, `test/vendor/react-dom.production.min.js`
- Use: test-only, so the standalone browser harness can render the client
  bundle without a DSH host. The shipped plugin does not bundle React; it
  requires the host's `react`.
- License: MIT, Copyright (c) Facebook, Inc. and its affiliates.
- Upstream: <https://github.com/facebook/react>

## DSH design tokens (test-only copy)

- File: `test/vendor/dsh-theme-tokens.css`
- Use: test-only. It lets `test/harness.html` render with the same CSS custom
  properties the DSH host provides. The plugin itself does not ship this file;
  at runtime it reads the tokens from the host.
- Source: the installed `@deepseek-ai/dsh-client-ui-theme` package
  (`lib/client.js`), extracted from `base.css`, `design-platform.css`,
  `gradient-shadow-text.css`, `scrollbar.css`, and `focus.css`.
- License: MIT (DSH is MIT licensed).
- Upstream: <https://github.com/deepseek-ai/deepseek-harness>
