/**
 * Editor chrome styles.
 *
 * Design tokens come from the installed DSH theme package:
 *   @deepseek-ai/dsh-client-ui-theme/lib/client.js
 *   (base.css / design-platform.css / scrollbar.css / focus.css sections)
 * DSH publishes colour, typography, radius, elevation, focus, motion and
 * scrollbar tokens as `--dsw-*` / `--ds-*` variables on <body>. The bridge
 * below maps them to plugin-scoped semantic names; every rule in this file
 * consumes those names, so there are no literal colours or scattered sizes.
 *
 * Gaps documented in docs/design-tokens.md:
 *   - DSH has no spacing/control-height scale  -> --uid-space-* / --uid-control-*
 *   - DSH has no icon/handle sizes            -> UI_SPEC in 00-core.js
 *   - DSH has no z-index scale                -> --uid-z-*
 * Those are explicit plugin-local semantics, not fabricated DSH tokens.
 */

const CLIENT_CSS = `
.uid-root {
  box-sizing: border-box;
  container-type: inline-size;
  container-name: uid-root;

  /* ── surfaces ───────────────────────────────────────────────────────── */
  --uid-color-bg: var(--dsw-alias-bg-base);
  --uid-color-panel: var(--dsw-specific-sidebar-fill);
  --uid-color-panel-2: var(--dsw-alias-bg-layer-2);
  --uid-color-card: var(--dsw-alias-bg-layer-1);
  --uid-color-elevated: var(--dsw-alias-bg-layer-3);
  --uid-color-overlay: var(--dsw-alias-bg-overlay);
  --uid-color-stage: var(--dsw-alias-bg-document-preview);
  --uid-color-hover: var(--dsw-alias-interactive-bg-hover);
  --uid-color-active: var(--dsw-alias-interactive-bg-active);
  --uid-color-accent-softer: var(--dsw-alias-interactive-bg-hover-accent);

  /* ── text ───────────────────────────────────────────────────────────── */
  --uid-color-text: var(--dsw-alias-label-primary);
  --uid-color-text-2: var(--dsw-alias-label-secondary);
  --uid-color-text-3: var(--dsw-alias-label-tertiary);
  --uid-color-text-4: var(--dsw-alias-label-caption);
  --uid-color-on-accent: var(--dsw-alias-label-primary-foreground);

  /* ── lines & states ─────────────────────────────────────────────────── */
  --uid-color-border: var(--dsw-alias-border-l2);
  --uid-color-border-subtle: var(--dsw-alias-border-l1);
  --uid-color-border-strong: var(--dsw-alias-border-l4);
  --uid-color-accent: var(--dsw-alias-state-business-primary);
  --uid-color-accent-soft: var(--dsw-alias-state-business-tertiary);
  --uid-color-danger: var(--dsw-alias-state-error-primary);
  --uid-color-danger-soft: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
  --uid-color-danger-line: color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent);
  --uid-color-success: var(--dsw-alias-state-success-primary);
  --uid-color-warn: var(--dsw-alias-state-warn-primary);
  --uid-color-mask: var(--dsw-alias-bg-mask-1);
  --uid-color-scrim: var(--dsw-alias-bg-mask-2);
  --uid-color-toast: var(--dsw-alias-toast-bg);
  --uid-color-toast-text: var(--dsw-alias-toast-label);
  --uid-color-tooltip: var(--dsw-alias-tooltip-bg);
  --uid-color-safe-area: var(--dsw-alias-link);
  --uid-color-selection: var(--dsw-alias-state-business-primary);
  --uid-color-guide: var(--dsw-alias-state-error-primary);
  --uid-color-grid: color-mix(in srgb, var(--dsw-alias-state-business-primary) 11%, transparent);
  --uid-color-checker: var(--dsw-alias-border-l2);
  --uid-color-checker-bg: var(--dsw-alias-bg-base);

  /* decorative "always dark" surfaces (preview) */
  --uid-color-ink: var(--dsw-static-neutral-00);
  --uid-color-ink-faint: color-mix(in srgb, var(--dsw-static-neutral-00) 44%, transparent);
  --uid-color-ink-line: color-mix(in srgb, var(--dsw-static-neutral-00) 10%, transparent);
  --uid-color-ink-panel: color-mix(in srgb, var(--dsw-static-neutral-bluish-1000) 78%, transparent);

  /* ── elevation ──────────────────────────────────────────────────────── */
  --uid-shadow-soft: var(--dsw-elevation-soft);
  --uid-shadow-panel: var(--dsw-elevation-panel);
  --uid-shadow-prominent: var(--dsw-elevation-prominent);
  --uid-shadow-menu: var(--dsw-shadow-lv3);
  --uid-shadow-card: var(--dsw-shadow-lv2);

  /* ── typography (DSH font ladder) ───────────────────────────────────── */
  --uid-font-family: var(--dsw-font-family);
  --uid-font-mono: var(--ds-font-family-code);
  --uid-font-caption: var(--dsw-font-xxs-12-font-size);
  --uid-font-label: var(--dsw-font-xs-13-font-size);
  --uid-font-body: var(--dsw-font-s-14-font-size);
  --uid-font-title: var(--dsw-font-base-16-font-size);
  --uid-font-heading: var(--dsw-font-l-20-font-size);
  --uid-font-display: var(--dsw-font-xl-24-font-size);
  --uid-line-caption: var(--dsw-font-xxs-12-line-height);
  --uid-line-label: var(--dsw-font-xs-13-line-height);
  --uid-line-body: var(--dsw-font-s-14-line-height);
  --uid-line-title: var(--dsw-font-base-16-line-height);
  --uid-line-heading: var(--dsw-font-l-20-line-height);
  --uid-line-display: var(--dsw-font-xl-24-line-height);
  --uid-weight-regular: var(--dsw-font-xxs-12-font-weight);
  --uid-weight-medium: var(--dsw-font-l-20-font-weight);
  --uid-weight-semibold: var(--dsw-font-xl-24-font-weight);
  --uid-weight-bold: var(--dsw-font-xl-24-font-weight);

  /* ── spacing ────────────────────────────────────────────────────────────
   * GAP: DSH publishes no spacing scale. This is the plugin's 2px-based
   * rhythm, declared once here so rules never carry raw px.
   * ──────────────────────────────────────────────────────────────────── */
  --uid-space-1: 2px;
  --uid-space-2: 4px;
  --uid-space-3: 6px;
  --uid-space-4: 8px;
  --uid-space-5: 10px;
  --uid-space-6: 12px;
  --uid-space-7: 14px;
  --uid-space-8: 16px;
  --uid-space-9: 20px;
  --uid-space-10: 24px;
  --uid-space-11: 32px;
  --uid-space-12: 40px;

  /* ── control sizes ─────────────────────────────────────────────────────
   * GAP: DSH has no control-height / rail-width tokens; these are the
   * plugin's own enlarged chrome metrics.
   * ──────────────────────────────────────────────────────────────────── */
  --uid-mobile-leading: 64px;
  --uid-control-xs: 28px;
  --uid-control-sm: 32px;
  --uid-control-md: 36px;
  --uid-control-lg: 44px;
  --uid-topbar-height: 64px;
  --uid-panel-head-height: 56px;
  --uid-rail-width: 264px;
  --uid-inspector-width: 304px;
  --uid-field-label-width: 76px;
  --uid-field-row-label-width: 28px;
  --uid-switch-width: 40px;
  --uid-switch-height: 22px;
  --uid-switch-thumb: 18px;
  --uid-switch-travel: 18px;
  --uid-mobile-bar-height: 64px;
  --uid-stage-grid: 24px;
  --uid-modal-library-width: 920px;
  --uid-modal-export-width: 840px;
  --uid-start-max: 1200px;
  --uid-home-workspace-width: 360px;
  --uid-home-panel-padding: 20px;
  --uid-home-template-min: 190px;
  --uid-home-refresh-height: 30px;
  --uid-home-side-min: 300px;
  --uid-home-size-min: 64px;
  --uid-home-size-min-compact: 58px;
  --uid-home-size-preview-width: 46px;
  --uid-home-size-preview-height: 48px;
  --uid-home-size-preview-width-compact: 42px;
  --uid-home-size-preview-height-compact: 44px;
  --uid-home-size-notch-top: 2px;
  --uid-home-size-notch-height: 2px;
  --uid-home-size-bar-height: 3px;
  --uid-home-search-width: 132px;
  --uid-home-recent-max-height: 296px;
  --uid-home-recent-thumb-width: 50px;
  --uid-home-recent-thumb-height: 48px;
  --uid-home-empty-min-height: 168px;
  --uid-home-empty-min-height-search: 160px;
  --uid-home-empty-text-max: 230px;
  --uid-home-template-thumb-width-compact: 104px;
  --uid-home-template-thumb-height-compact: 96px;
  --uid-mobile-rail: min(88vw, 340px);
  --uid-mobile-inspector: min(90vw, 380px);
  --uid-icon-hit: 32px;
  --uid-title-max: 420px;
  --uid-workspace-pick-max: 180px;
  --uid-workspace-select-max: 132px;
  --uid-search-inline-width: 240px;
  --uid-comp-card-min-height: 80px;
  --uid-template-thumb-height: 158px;
  --uid-template-thumb-height-compact: 128px;
  --uid-modal-max-height: 860px;
  --uid-export-preview-max-height: 340px;
  --uid-export-image-max-width: 300px;
  --uid-export-image-max-height: 320px;
  --uid-export-image-max-height-compact: 220px;
  --uid-hairline: 1px;
  --uid-zoom-value-min-width: 56px;
  --uid-textarea-min-height: 72px;
  --uid-range-value-min-width: 44px;
  --uid-range-number-width: 64px;
  --uid-range-slider-min: 48px;
  --uid-range-track-height: 4px;
  --uid-range-thumb-size: 14px;
  --uid-range-thumb-border: 2px;
  --uid-md-swatch: 14px;
  --uid-md-gap: 2px;
  --uid-md-label: 40px;
  --uid-md-max-height: 240px;
  --uid-icon-grid-max: 180px;
  --uid-md-radius: 4px;
  --uid-image-thumb-width: 64px;
  --uid-image-thumb-height: 48px;
  --uid-empty-text-max-width: 240px;
  --uid-start-padding-block-end: 48px;
  --uid-design-thumb-width: 92px;
  --uid-design-thumb-height: 68px;
  --uid-modal-workspace-select-min-width: 130px;
  --uid-modal-workspace-select-max-width: 210px;
  --uid-export-preview-min-height: 320px;
  --uid-export-preview-min-height-compact: 230px;
  --uid-preview-bar-height: 56px;
  --uid-toast-max-width: 560px;

  /* ── radii ──────────────────────────────────────────────────────────── */
  --uid-radius-xs: var(--dsw-radius-xs);
  --uid-radius-sm: var(--dsw-radius-sm);
  --uid-radius-md: var(--dsw-radius-md);
  --uid-radius-lg: var(--dsw-radius-lg);
  --uid-radius-xl: var(--dsw-radius-xl);
  --uid-radius-panel: var(--dsw-radius-panel);
  --uid-radius-pill: 9999px;

  /* ── borders / focus / motion ───────────────────────────────────────── */
  --uid-border-width: 1px;
  --uid-border-width-strong: 1.5px;
  --uid-focus-width: var(--dsw-focus-ring-width);
  --uid-focus-color: var(--dsw-alias-state-business-primary);
  /* M3-style state layer alphas; hover/active/selected are realised with the
   * DSH interactive/selected tokens (see docs/design-tokens.md). */
  --uid-state-hover: 0.08;
  --uid-state-focus: 0.12;
  --uid-state-pressed: 0.12;
  --uid-state-disabled: 0.38;
  --uid-state-selected: 0.12;
  --uid-blur-scrim: blur(var(--uid-space-2));
  --uid-duration-fast: var(--ds-transition-duration-fast);
  --uid-duration: var(--ds-transition-duration);
  --uid-duration-slow: var(--ds-transition-duration-slow);
  --uid-ease: var(--ds-ease-in-out);

  /* ── layering ───────────────────────────────────────────────────────────
   * GAP: DSH exposes no z-index scale.
   * ──────────────────────────────────────────────────────────────────── */
  --uid-z-base: 1;
  --uid-z-raised: 2;
  --uid-z-stage: 10;
  --uid-z-rail: 20;
  --uid-z-topbar: 30;
  --uid-z-floating: 40;
  --uid-z-scrim: 50;
  --uid-z-mobile-rail: 60;
  --uid-z-modal: 200;
  --uid-z-preview: 300;
  --uid-z-toast: 500;

  /* ── DSH window-chrome safe area ────────────────────────────────────────
   * The collapsed macOS sidebar mounts the reopen / New Session controls
   * over the main panel and publishes --dsh-frame-leading-clearance from
   * the frame's left edge. Windows publishes --dsh-windows-menu-start.
   * Both are inherited, and both are 0 on a plain web page.
   * ──────────────────────────────────────────────────────────────────── */
  --uid-safe-inline: max(var(--dsh-frame-leading-clearance, 0px), var(--dsh-windows-menu-start, 0px));
  --uid-safe-block: var(--dsh-frame-top-clearance, 0px);

  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding-block-start: var(--uid-safe-block);
  overflow: hidden;
  color: var(--uid-color-text);
  background: var(--uid-color-bg);
  font-family: var(--uid-font-family);
  font-size: var(--uid-font-body);
  line-height: var(--uid-line-body);
  -webkit-font-smoothing: antialiased;
}
.uid-root *, .uid-root *::before, .uid-root *::after { box-sizing: border-box; }
.uid-root :where(button, input, select, textarea) { font: inherit; color: inherit; }
.uid-root :where(button) { color: inherit; }
.uid-root button { -webkit-tap-highlight-color: transparent; }
.uid-root ::selection { background: var(--uid-color-accent-soft); color: var(--uid-color-text); }
.uid-root :focus-visible { outline: var(--uid-focus-width) solid var(--uid-focus-color); outline-offset: var(--uid-space-1); }
.uid-icon { display: block; flex: none; }
.uid-brandmark { display: block; flex: none; }

/* ── top bar ─────────────────────────────────────────────────────────── */
.uid-topbar {
  position: relative;
  z-index: var(--uid-z-topbar);
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--uid-space-6);
  height: var(--uid-topbar-height);
  padding-inline: calc(var(--uid-space-8) + var(--uid-safe-inline)) var(--uid-space-8);
  border-bottom: var(--uid-border-width) solid var(--uid-color-border);
  background: color-mix(in srgb, var(--uid-color-bg) 92%, transparent);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
}
.uid-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--uid-space-4);
  flex: none;
  height: var(--uid-control-md);
  padding-inline: var(--uid-space-2) var(--uid-space-4);
  border: 0;
  border-radius: var(--uid-radius-sm);
  background: transparent;
  color: var(--uid-color-text);
  cursor: pointer;
  font-weight: var(--uid-weight-semibold);
  font-size: var(--uid-font-title);
  line-height: var(--uid-line-title);
  transition: background var(--uid-duration-fast) var(--uid-ease);
}
.uid-brand:hover { background: var(--uid-color-hover); }
.uid-topbar-divider { width: var(--uid-border-width); height: var(--uid-space-10); background: var(--uid-color-border); flex: none; }
.uid-title-wrap { min-width: 0; flex: 1; display: flex; flex-direction: column; justify-content: center; }
.uid-title-input {
  width: min(var(--uid-title-max), 100%);
  min-width: 0;
  margin-inline-start: 0;
  padding: var(--uid-space-1) var(--uid-space-3);
  border: var(--uid-border-width) solid transparent;
  border-radius: var(--uid-radius-sm);
  background: transparent;
  font-size: var(--uid-font-title);
  font-weight: var(--uid-weight-semibold);
  line-height: var(--uid-line-title);
  outline: none;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.uid-title-input:hover { border-color: var(--uid-color-border); }
.uid-title-input:focus { border-color: var(--uid-color-accent); background: var(--uid-color-bg); }
.uid-save-state { font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); color: var(--uid-color-text-3); padding-inline-start: var(--uid-space-1); }
.uid-save-state.is-dirty { color: var(--uid-color-warn); }
.uid-save-state.is-saving { color: var(--uid-color-accent); }
.uid-save-state.is-saved { color: var(--uid-color-success); }
.uid-topbar-context { flex: 1; color: var(--uid-color-text-3); font-size: var(--uid-font-body); line-height: var(--uid-line-body); }
.uid-topbar-actions { margin-inline-start: auto; display: flex; align-items: center; gap: var(--uid-space-4); flex: none; }
.uid-topbar-group { display: flex; align-items: center; gap: var(--uid-space-1); padding: var(--uid-space-1); border-radius: var(--uid-radius-sm); background: var(--uid-color-hover); }
.uid-workspace-pick {
  display: inline-flex;
  align-items: center;
  gap: var(--uid-space-2);
  max-width: var(--uid-workspace-pick-max);
  height: var(--uid-control-sm);
  padding-inline: var(--uid-space-3);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-sm);
  color: var(--uid-color-text-3);
  background: var(--uid-color-card);
}
.uid-workspace-pick select {
  min-width: 0;
  max-width: var(--uid-workspace-select-max);
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--uid-color-text-2);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
  cursor: pointer;
  appearance: none;
  text-overflow: ellipsis;
}

/* ── generic controls ────────────────────────────────────────────────── */
.uid-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--uid-space-3);
  height: var(--uid-control-md);
  padding-inline: var(--uid-space-7);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-card);
  color: var(--uid-color-text);
  font-size: var(--uid-font-body);
  font-weight: var(--uid-weight-medium);
  line-height: var(--uid-line-body);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--uid-duration-fast) var(--uid-ease), border-color var(--uid-duration-fast) var(--uid-ease), color var(--uid-duration-fast) var(--uid-ease);
}
.uid-btn:hover:not(:disabled) { background: var(--uid-color-hover); border-color: var(--uid-color-border-strong); }
.uid-btn:active:not(:disabled) { background: var(--uid-color-active); }
.uid-btn:disabled { opacity: var(--uid-state-disabled); cursor: default; }
.uid-btn-primary { background: var(--dsw-alias-button-primary-fill); border-color: transparent; color: var(--dsw-alias-label-primary-foreground); }
.uid-btn-primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); border-color: transparent; }
.uid-btn-accent { background: var(--uid-color-accent); border-color: transparent; color: var(--uid-color-on-accent); }
.uid-btn-accent:hover:not(:disabled) { background: color-mix(in srgb, var(--uid-color-accent) 86%, var(--uid-color-text)); border-color: transparent; }
.uid-btn-quiet { background: transparent; }
.uid-btn-quiet:hover:not(:disabled) { background: var(--uid-color-hover); }
.uid-btn-lg { height: var(--uid-control-lg); padding-inline: var(--uid-space-9); border-radius: var(--uid-radius-md); font-size: var(--uid-font-title); line-height: var(--uid-line-title); }
.uid-link { border: 0; background: transparent; color: var(--uid-color-accent); font-size: var(--uid-font-label); line-height: var(--uid-line-label); cursor: pointer; padding: var(--uid-space-1) var(--uid-space-2); border-radius: var(--uid-radius-xs); }
.uid-link:hover { text-decoration: underline; }
.uid-link.danger { color: var(--uid-color-danger); }
.uid-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--uid-icon-hit);
  height: var(--uid-icon-hit);
  flex: none;
  padding: 0;
  border: 0;
  border-radius: var(--uid-radius-sm);
  background: transparent;
  color: var(--uid-color-text-2);
  cursor: pointer;
  transition: background var(--uid-duration-fast) var(--uid-ease), color var(--uid-duration-fast) var(--uid-ease);
}
.uid-iconbtn:hover:not(:disabled) { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-iconbtn.is-active { background: var(--uid-color-accent-soft); color: var(--uid-color-accent); box-shadow: inset 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--uid-color-accent) 34%, transparent); }
.uid-iconbtn.is-danger:hover { background: var(--uid-color-danger-soft); color: var(--uid-color-danger); }
.uid-iconbtn:disabled { opacity: var(--uid-state-disabled); cursor: default; }
.uid-toolbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--uid-space-3);
  height: var(--uid-control-sm);
  padding-inline: var(--uid-space-5);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-sm);
  background: transparent;
  color: var(--uid-color-text-2);
  font-size: var(--uid-font-label);
  font-weight: var(--uid-weight-medium);
  line-height: var(--uid-line-label);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--uid-duration-fast) var(--uid-ease), border-color var(--uid-duration-fast) var(--uid-ease), color var(--uid-duration-fast) var(--uid-ease);
}
.uid-toolbtn:hover:not(:disabled) { background: var(--uid-color-hover); color: var(--uid-color-text); border-color: var(--uid-color-border-strong); }
.uid-toolbtn.is-danger:hover { color: var(--uid-color-danger); border-color: var(--uid-color-danger-line); background: var(--uid-color-danger-soft); }
.uid-toolbtn:disabled { opacity: var(--uid-state-disabled); cursor: default; }
.uid-inline-actions { display: flex; align-items: center; gap: var(--uid-space-3); flex-wrap: wrap; }
.uid-spinner {
  width: var(--uid-space-10);
  height: var(--uid-space-10);
  border: var(--uid-border-width-strong) solid var(--uid-color-border-strong);
  border-top-color: var(--uid-color-accent);
  border-radius: var(--uid-radius-pill);
  animation: uid-spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes uid-spin { to { transform: rotate(360deg); } }

/* ── shared state layers ─────────────────────────────────────────────── */
.uid-btn.is-hover,
.uid-toolbtn.is-hover,
.uid-tab.is-hover,
.uid-iconbtn.is-hover { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-btn.is-pressed,
.uid-toolbtn.is-pressed,
.uid-tab.is-pressed,
.uid-iconbtn.is-pressed { background: var(--uid-color-active); }
.uid-btn.is-focus,
.uid-toolbtn.is-focus,
.uid-tab.is-focus,
.uid-iconbtn.is-focus,
.uid-input.is-focus { outline: var(--uid-focus-width) solid var(--uid-focus-color); outline-offset: var(--uid-space-1); }
.uid-btn.is-disabled,
.uid-toolbtn.is-disabled,
.uid-tab.is-disabled,
.uid-iconbtn.is-disabled,
.uid-input.is-disabled { opacity: var(--uid-state-disabled); cursor: default; pointer-events: none; }
.uid-btn.is-selected,
.uid-toolbtn.is-selected,
.uid-tab.is-selected,
.uid-iconbtn.is-selected { background: var(--uid-color-accent-soft); border-color: var(--uid-color-accent); color: var(--uid-color-accent); }
.uid-input.is-hover { border-color: var(--uid-color-border-strong); }

/* ── workbench ───────────────────────────────────────────────────────── */
.uid-workbench { flex: 1; min-height: 0; display: flex; position: relative; overflow: hidden; }
.uid-rail {
  width: var(--uid-rail-width);
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--uid-color-panel);
  border-inline-end: var(--uid-border-width) solid var(--uid-color-border);
  z-index: var(--uid-z-rail);
}
.uid-inspector-rail { width: var(--uid-inspector-width); border-inline-end: 0; border-inline-start: var(--uid-border-width) solid var(--uid-color-border); background: var(--uid-color-card); }
.uid-panel-head {
  flex: none;
  min-height: var(--uid-panel-head-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--uid-space-3);
  padding-inline: var(--uid-space-8);
  border-bottom: var(--uid-border-width) solid var(--uid-color-border);
}
.uid-panel-title { font-size: var(--uid-font-title); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-title); }
.uid-rail-head { padding-inline: var(--uid-space-6) var(--uid-space-4); }
.uid-panel-scroll { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }

/* tabs */
.uid-tabs { display: flex; align-items: center; gap: var(--uid-space-1); min-width: 0; }
.uid-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--uid-space-2);
  height: var(--uid-control-sm);
  padding-inline: var(--uid-space-5);
  border: 0;
  border-radius: var(--uid-radius-sm);
  background: transparent;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-label);
  font-weight: var(--uid-weight-medium);
  line-height: var(--uid-line-label);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--uid-duration-fast) var(--uid-ease), color var(--uid-duration-fast) var(--uid-ease);
}
.uid-tab:hover { color: var(--uid-color-text); background: var(--uid-color-hover); }
.uid-tab.is-active { color: var(--uid-color-text); background: var(--uid-color-card); box-shadow: var(--uid-shadow-card), inset 0 calc(var(--uid-space-1) * -1) 0 var(--uid-color-accent); }
.uid-tab-count { font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); color: var(--uid-color-text-3); background: var(--uid-color-hover); border-radius: var(--uid-radius-pill); padding-inline: var(--uid-space-2); }

/* ── component library ───────────────────────────────────────────────── */
.uid-library { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.uid-search {
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  flex: none;
  height: var(--uid-control-md);
  margin: var(--uid-space-6) var(--uid-space-7) var(--uid-space-4);
  padding-inline: var(--uid-space-5);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-card);
  color: var(--uid-color-text-3);
  transition: border-color var(--uid-duration-fast) var(--uid-ease), box-shadow var(--uid-duration-fast) var(--uid-ease);
}
.uid-search:focus-within { border-color: var(--uid-color-accent); box-shadow: 0 0 0 var(--uid-space-1) var(--uid-color-accent-soft); }
.uid-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--uid-color-text); font-size: var(--uid-font-label); line-height: var(--uid-line-label); }
.uid-search input::placeholder { color: var(--uid-color-text-3); }
.uid-search-inline { margin: 0; width: var(--uid-search-inline-width); flex: none; }
.uid-library-scroll { flex: 1; min-height: 0; overflow: auto; padding: 0 var(--uid-space-4) var(--uid-space-10); scrollbar-gutter: stable; }
.uid-comp-group { margin-bottom: var(--uid-space-2); }
.uid-comp-group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  height: var(--uid-control-sm);
  padding-inline: var(--uid-space-3);
  border: 0;
  border-radius: var(--uid-radius-xs);
  background: transparent;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  font-weight: var(--uid-weight-semibold);
  line-height: var(--uid-line-caption);
  cursor: pointer;
  letter-spacing: 0.02em;
}
.uid-comp-group-head:hover { color: var(--uid-color-text-2); background: var(--uid-color-hover); }
.uid-comp-count { margin-inline-start: auto; font-size: var(--uid-font-caption); font-weight: var(--uid-weight-regular); opacity: 0.7; }
.uid-comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--uid-space-4); padding: var(--uid-space-1) var(--uid-space-2) var(--uid-space-5); }
.uid-comp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--uid-space-3);
  min-height: var(--uid-comp-card-min-height);
  padding: var(--uid-space-5) var(--uid-space-2);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-md);
  background: var(--uid-color-card);
  color: var(--uid-color-text-2);
  cursor: grab;
  transition: border-color var(--uid-duration-fast) var(--uid-ease), transform var(--uid-duration-fast) var(--uid-ease), box-shadow var(--uid-duration-fast) var(--uid-ease), background var(--uid-duration-fast) var(--uid-ease);
}
.uid-comp-card:hover { border-color: color-mix(in srgb, var(--uid-color-accent) 46%, var(--uid-color-border)); background: var(--uid-color-accent-softer); box-shadow: var(--uid-shadow-soft); transform: translateY(calc(var(--uid-space-1) * -1)); }
.uid-comp-card:active { cursor: grabbing; transform: none; }
.uid-comp-icon {
  width: var(--uid-space-12);
  height: var(--uid-space-12);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--uid-radius-sm);
  color: var(--uid-color-text-2);
  background: transparent;
}
.uid-comp-card:hover .uid-comp-icon { color: var(--uid-color-accent); }
.uid-comp-label { font-size: var(--uid-font-label); font-weight: var(--uid-weight-medium); line-height: var(--uid-line-label); color: var(--uid-color-text-2); }
.uid-library-tip {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--uid-space-2);
  padding: var(--uid-space-5) var(--uid-space-7);
  border-top: var(--uid-border-width) solid var(--uid-color-border);
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
}

/* ── layers ──────────────────────────────────────────────────────────── */
.uid-layers { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.uid-layers-toolbar { flex: none; display: flex; align-items: center; justify-content: space-between; height: var(--uid-control-lg); padding-inline: var(--uid-space-7) var(--uid-space-5); }
.uid-layers-count { font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); color: var(--uid-color-text-3); }
.uid-layer-scroll { flex: 1; min-height: 0; overflow: auto; padding: 0 var(--uid-space-3) var(--uid-space-10); scrollbar-gutter: stable; }
.uid-layer-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  height: var(--uid-space-12);
  padding-inline: var(--uid-space-3);
  border-radius: var(--uid-radius-sm);
  cursor: pointer;
  color: var(--uid-color-text-2);
  transition: background var(--uid-duration-fast) var(--uid-ease), color var(--uid-duration-fast) var(--uid-ease);
}
.uid-layer-row:hover { background: var(--uid-color-hover); }
.uid-layer-row.is-selected { background: var(--uid-color-accent-soft); color: var(--uid-color-text); box-shadow: inset var(--uid-space-1) 0 0 var(--uid-color-accent); }
.uid-layer-row.is-drop { box-shadow: inset 0 var(--uid-space-1) 0 var(--uid-color-accent); }
.uid-layer-grip { color: var(--uid-color-text-3); opacity: 0.5; display: flex; cursor: grab; }
.uid-layer-icon { width: var(--uid-space-10); color: var(--uid-color-text-3); display: flex; justify-content: center; }
.uid-layer-name { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: var(--uid-line-label); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: var(--uid-font-body); }
.uid-layer-sub { color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); overflow: hidden; text-overflow: ellipsis; }
.uid-layer-actions { display: flex; align-items: center; gap: 0; opacity: 0; transition: opacity var(--uid-duration-fast) var(--uid-ease); }
.uid-layer-row:hover .uid-layer-actions, .uid-layer-row.is-selected .uid-layer-actions { opacity: 1; }
.uid-layer-actions .uid-iconbtn { width: var(--uid-control-xs); height: var(--uid-control-xs); }

/* ── stage ───────────────────────────────────────────────────────────── */
.uid-stage {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
  background-color: var(--uid-color-stage);
  background-image: radial-gradient(circle at var(--uid-hairline) var(--uid-hairline), var(--uid-color-grid) var(--uid-hairline), transparent 0);
  background-size: var(--uid-stage-grid) var(--uid-stage-grid);
  user-select: none;
}
.uid-stage.is-pan { cursor: grab; }
.uid-stage.is-space { cursor: grab; }
.uid-board {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  will-change: transform;
  box-shadow: var(--uid-shadow-menu);
}
.uid-artboard { position: relative; overflow: hidden; }
.uid-node { position: absolute; }
.uid-safearea, .uid-marquee, .uid-selection { pointer-events: none; }
.uid-selection { position: absolute; border-style: solid; border-color: var(--uid-color-selection); box-shadow: 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--uid-color-bg) 18%, transparent); }
.uid-sel-handle {
  position: absolute;
  display: block;
  background: var(--uid-color-bg);
  border: var(--uid-border-width) solid var(--uid-color-selection);
  border-radius: var(--uid-radius-xs);
  box-sizing: border-box;
  box-shadow: var(--uid-shadow-card);
}
.uid-rotate-handle {
  position: absolute;
  display: block;
  border-radius: var(--uid-radius-pill);
  background: var(--uid-color-bg);
  border: var(--uid-border-width) solid var(--uid-color-selection);
  box-sizing: border-box;
  cursor: grab;
  box-shadow: var(--uid-shadow-card);
}
.uid-rotate-stem { position: absolute; background: var(--uid-color-selection); opacity: 0.55; pointer-events: none; }
.uid-size-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: var(--uid-color-selection);
  color: var(--uid-color-on-accent);
  font-family: var(--uid-font-mono);
  white-space: nowrap;
  line-height: var(--uid-line-caption);
  pointer-events: none;
}
.uid-text-editor {
  position: absolute;
  z-index: var(--uid-z-mobile-rail);
  margin: 0;
  padding: var(--uid-space-1) var(--uid-space-2);
  border: var(--uid-border-width-strong) solid var(--uid-color-accent);
  outline: none;
  resize: none;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--uid-color-card);
  color: var(--uid-color-text);
  box-shadow: var(--uid-shadow-prominent);
  caret-color: var(--uid-color-accent);
}
.uid-marquee { position: absolute; border: var(--uid-border-width) dashed var(--uid-color-selection); background: var(--uid-color-accent-soft); }
.uid-guide { position: absolute; z-index: var(--uid-z-rail); background: var(--uid-color-guide); box-shadow: 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--uid-color-bg) 70%, transparent); pointer-events: none; }
.uid-guide-v { width: var(--uid-border-width); }
.uid-guide-h { height: var(--uid-border-width); }
.uid-stage-info {
  position: absolute;
  left: var(--uid-space-7);
  top: var(--uid-space-6);
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  height: var(--uid-control-xs);
  padding-inline: var(--uid-space-5);
  border-radius: var(--uid-radius-sm);
  background: color-mix(in srgb, var(--uid-color-bg) 82%, transparent);
  border: var(--uid-border-width) solid var(--uid-color-border);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
  pointer-events: none;
  z-index: var(--uid-z-floating);
}
.uid-stage-dot { width: var(--uid-space-2); height: var(--uid-space-2); border-radius: var(--uid-radius-pill); background: var(--uid-color-success); }
.uid-stage-info-sep { opacity: 0.4; }
.uid-stage-tip {
  position: absolute;
  right: var(--uid-space-7);
  bottom: var(--uid-space-8);
  display: flex;
  align-items: center;
  gap: var(--uid-space-2);
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
  pointer-events: none;
  z-index: var(--uid-z-floating);
}
.uid-zoombar {
  position: absolute;
  left: 50%;
  bottom: var(--uid-space-6);
  transform: translateX(-50%);
  z-index: var(--uid-z-floating);
  display: flex;
  align-items: center;
  gap: var(--uid-space-1);
  padding: var(--uid-space-1);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-md);
  background: color-mix(in srgb, var(--uid-color-bg) 88%, transparent);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  box-shadow: var(--uid-shadow-panel);
}
.uid-zoombar .uid-iconbtn { width: var(--uid-control-sm); height: var(--uid-control-sm); }
.uid-zoom-value { min-width: var(--uid-zoom-value-min-width); height: var(--uid-control-sm); border: 0; border-radius: var(--uid-radius-sm); background: transparent; color: var(--uid-color-text-2); font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); cursor: pointer; }
.uid-zoom-value:hover { background: var(--uid-color-hover); }
.uid-zoombar-divider { width: var(--uid-border-width); height: var(--uid-space-8); background: var(--uid-color-border); margin-inline: var(--uid-space-2); }

/* ── inspector ───────────────────────────────────────────────────────── */
.uid-inspector { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.uid-section { border-bottom: var(--uid-border-width) solid var(--uid-color-border); padding: var(--uid-space-7) var(--uid-space-8) var(--uid-space-8); }
.uid-section:last-child { border-bottom: 0; }
.uid-section-head { display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-4); margin-bottom: var(--uid-space-5); }
.uid-section-title { font-size: var(--uid-font-caption); font-weight: var(--uid-weight-semibold); letter-spacing: 0.06em; text-transform: uppercase; color: var(--uid-color-text-3); line-height: var(--uid-line-caption); }
.uid-section-body { display: flex; flex-direction: column; gap: var(--uid-space-5); }
.uid-field { display: flex; align-items: center; gap: var(--uid-space-4); min-width: 0; }
.uid-field-label { flex: none; width: var(--uid-field-label-width); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); }
.uid-field-control { flex: 1; min-width: 0; display: flex; align-items: center; }
.uid-field.is-wide { align-items: flex-start; flex-direction: column; gap: var(--uid-space-3); }
.uid-field.is-wide .uid-field-label { width: auto; }
.uid-field.is-wide .uid-field-control { width: 100%; }
.uid-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--uid-space-4); }
.uid-field-row .uid-field-label { width: var(--uid-field-row-label-width); }
.uid-input {
  width: 100%;
  height: var(--uid-control-md);
  padding-inline: var(--uid-space-5);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-sm);
  outline: none;
  background: var(--uid-color-bg);
  color: var(--uid-color-text);
  font-size: var(--uid-font-body);
  line-height: var(--uid-line-body);
  transition: border-color var(--uid-duration-fast) var(--uid-ease), box-shadow var(--uid-duration-fast) var(--uid-ease);
}
.uid-input:hover { border-color: var(--uid-color-border-strong); }
.uid-input:focus { border-color: var(--uid-color-accent); box-shadow: 0 0 0 var(--uid-space-1) var(--uid-color-accent-soft); }
.uid-input::placeholder { color: var(--uid-color-text-3); }
.uid-textarea { height: auto; min-height: var(--uid-textarea-min-height); padding: var(--uid-space-4) var(--uid-space-5); resize: vertical; line-height: var(--uid-line-body); }
.uid-select {
  appearance: none;
  padding-inline-end: var(--uid-space-11);
  background-image: linear-gradient(45deg, transparent 50%, var(--uid-color-text-3) 50%), linear-gradient(135deg, var(--uid-color-text-3) 50%, transparent 50%);
  background-position: calc(100% - var(--uid-space-6)) calc(50% - var(--uid-space-2)), calc(100% - var(--uid-space-4)) calc(50% - var(--uid-space-2));
  background-size: var(--uid-space-2) var(--uid-space-2), var(--uid-space-2) var(--uid-space-2);
  background-repeat: no-repeat;
  cursor: pointer;
}
.uid-number { position: relative; display: flex; align-items: center; width: 100%; }
.uid-input-number { padding-inline-end: var(--uid-space-9); font-variant-numeric: tabular-nums; }
.uid-number-suffix { position: absolute; right: var(--uid-space-4); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); pointer-events: none; }
.uid-color { display: flex; flex-direction: column; align-items: stretch; gap: var(--uid-space-3); width: 100%; }
.uid-color-row { display: flex; align-items: center; gap: var(--uid-space-3); width: 100%; }
.uid-color-swatch {
  position: relative;
  width: var(--uid-control-sm);
  height: var(--uid-control-sm);
  flex: none;
  border-radius: var(--uid-radius-sm);
  border: var(--uid-border-width) solid var(--uid-color-border-strong);
  overflow: hidden;
  background-image:
    linear-gradient(45deg, var(--uid-color-checker) 25%, transparent 25%),
    linear-gradient(-45deg, var(--uid-color-checker) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--uid-color-checker) 75%),
    linear-gradient(-45deg, transparent 75%, var(--uid-color-checker) 75%);
  background-color: var(--uid-color-checker-bg);
  background-size: var(--uid-space-2) var(--uid-space-2);
  background-position: 0 0, 0 var(--uid-space-1), var(--uid-space-1) calc(var(--uid-space-1) * -1), calc(var(--uid-space-1) * -1) 0;
}
.uid-color-swatch input { position: absolute; inset: calc(var(--uid-space-4) * -1); width: var(--uid-space-12); height: var(--uid-space-12); border: 0; padding: 0; cursor: pointer; opacity: 0; }
.uid-color-swatch.is-empty::after { content: "T"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: var(--uid-font-caption); color: var(--uid-color-text-3); background: var(--uid-color-bg); }
.uid-color-text { flex: 1; min-width: 0; font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); }
.uid-color-clear { flex: none; width: var(--uid-control-xs); height: var(--uid-control-sm); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: transparent; color: var(--uid-color-text-3); font-size: var(--uid-font-caption); cursor: pointer; }
.uid-color-clear:hover { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-color-palette-btn { flex: none; display: inline-flex; align-items: center; justify-content: center; width: var(--uid-control-xs); height: var(--uid-control-sm); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: transparent; color: var(--uid-color-text-3); cursor: pointer; }
.uid-color-palette-btn:hover { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-color-palette-btn.is-active { border-color: var(--uid-color-accent); color: var(--uid-color-accent); background: var(--uid-color-accent-soft); }
.uid-md-palette { display: flex; flex-direction: column; gap: var(--uid-space-1); max-height: var(--uid-md-max-height); overflow: auto; padding: var(--uid-space-3); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: var(--uid-color-bg); }
.uid-md-head { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-3); padding-bottom: var(--uid-space-2); background: var(--uid-color-bg); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); }
.uid-md-close { display: inline-flex; align-items: center; justify-content: center; width: var(--uid-control-xs); height: var(--uid-control-xs); border: 0; border-radius: var(--uid-radius-sm); background: transparent; color: var(--uid-color-text-3); cursor: pointer; }
.uid-md-close:hover { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-md-row { display: grid; grid-template-columns: var(--uid-md-label) minmax(0, 1fr); align-items: center; gap: var(--uid-space-2); }
.uid-md-name { color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); white-space: nowrap; }
.uid-md-swatches { display: grid; grid-template-columns: repeat(14, minmax(0, 1fr)); grid-auto-rows: var(--uid-md-swatch); gap: var(--uid-md-gap); }
.uid-md-swatch { width: 100%; height: var(--uid-md-swatch); padding: 0; border: 0; border-radius: var(--uid-md-radius); cursor: pointer; box-shadow: inset 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--uid-color-text) 12%, transparent); }
.uid-md-swatch:hover { transform: scale(1.18); }
.uid-md-swatch.is-active { outline: var(--uid-focus-width) solid var(--uid-color-accent); outline-offset: var(--uid-border-width); }
.uid-icon-picker { display: flex; flex-direction: column; gap: var(--uid-space-2); width: 100%; }
.uid-icon-trigger { display: flex; align-items: center; gap: var(--uid-space-3); width: 100%; height: var(--uid-control-md); padding-inline: var(--uid-space-4); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: var(--uid-color-bg); color: var(--uid-color-text); cursor: pointer; }
.uid-icon-trigger:hover { border-color: var(--uid-color-border-strong); }
.uid-icon-trigger.is-open { border-color: var(--uid-color-accent); }
.uid-icon-trigger-glyph { flex: none; display: inline-flex; align-items: center; justify-content: center; width: var(--uid-control-sm); height: var(--uid-control-sm); border-radius: var(--uid-radius-xs); color: var(--uid-color-accent); background: var(--uid-color-accent-soft); }
.uid-icon-trigger-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); color: var(--uid-color-text-2); }
.uid-icon-trigger-caret { flex: none; color: var(--uid-color-text-3); }
.uid-icon-grid { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: var(--uid-space-1); max-height: var(--uid-icon-grid-max); overflow: auto; padding: var(--uid-space-2); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: var(--uid-color-bg); }
.uid-icon-cell { display: inline-flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: 1; border: var(--uid-border-width) solid transparent; border-radius: var(--uid-radius-xs); background: transparent; color: var(--uid-color-text-2); cursor: pointer; }
.uid-icon-cell:hover { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-icon-cell.is-active { border-color: var(--uid-color-accent); background: var(--uid-color-accent-soft); color: var(--uid-color-accent); }

.uid-range { display: flex; align-items: center; gap: var(--uid-space-2); width: 100%; }
.uid-range > input[type="range"] {
  flex: 1;
  min-width: var(--uid-range-slider-min);
  height: var(--uid-space-9);
  margin: 0;
  border-radius: var(--uid-radius-pill);
  background: linear-gradient(to right, var(--uid-color-accent) 0 var(--uid-range-progress), var(--uid-color-border) var(--uid-range-progress) 100%) center / 100% var(--uid-range-track-height) no-repeat;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
.uid-range > input[type="range"]::-webkit-slider-runnable-track { height: var(--uid-range-track-height); background: transparent; border-radius: var(--uid-radius-pill); }
.uid-range > input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: var(--uid-range-thumb-size);
  height: var(--uid-range-thumb-size);
  margin-top: calc((var(--uid-range-track-height) - var(--uid-range-thumb-size)) / 2);
  border: var(--uid-range-thumb-border) solid var(--uid-color-bg);
  border-radius: 50%;
  background: var(--uid-color-accent);
  box-shadow: 0 0 0 var(--uid-border-width) var(--uid-color-accent);
}
.uid-range > input[type="range"]::-moz-range-track { height: var(--uid-range-track-height); background: var(--uid-color-border); border-radius: var(--uid-radius-pill); }
.uid-range > input[type="range"]::-moz-range-progress { height: var(--uid-range-track-height); background: var(--uid-color-accent); border-radius: var(--uid-radius-pill); }
.uid-range > input[type="range"]::-moz-range-thumb { width: var(--uid-range-thumb-size); height: var(--uid-range-thumb-size); border: var(--uid-range-thumb-border) solid var(--uid-color-bg); border-radius: 50%; background: var(--uid-color-accent); box-shadow: 0 0 0 var(--uid-border-width) var(--uid-color-accent); }
.uid-range > input[type="range"]:focus-visible { outline: var(--uid-focus-width) solid var(--uid-color-accent); outline-offset: var(--uid-space-1); }
.uid-range-number { position: relative; flex: none; display: flex; align-items: center; width: var(--uid-range-number-width); }
.uid-range-number-input {
  height: var(--uid-control-sm);
  padding-inline: var(--uid-space-2) var(--uid-space-8);
  text-align: right;
  font-size: var(--uid-font-caption);
  font-variant-numeric: tabular-nums;
}
.uid-range-number-input::-webkit-inner-spin-button,
.uid-range-number-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.uid-range-number-input { -moz-appearance: textfield; appearance: textfield; }
.uid-range-suffix { position: absolute; right: var(--uid-space-2); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); pointer-events: none; }
.uid-switch { width: var(--uid-switch-width); height: var(--uid-switch-height); flex: none; padding: var(--uid-space-1); border: 0; border-radius: var(--uid-radius-pill); background: var(--uid-color-border-strong); cursor: pointer; transition: background var(--uid-duration) var(--uid-ease); }
.uid-switch.is-on { background: var(--uid-color-accent); }
.uid-switch-thumb { display: block; width: var(--uid-switch-thumb); height: var(--uid-switch-thumb); border-radius: var(--uid-radius-pill); background: var(--dsw-alias-switch-thumb); box-shadow: var(--uid-shadow-card); transition: transform var(--uid-duration) var(--uid-ease); }
.uid-switch.is-on .uid-switch-thumb { transform: translateX(var(--uid-switch-travel)); }
.uid-switch-row { display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-5); color: var(--uid-color-text-2); font-size: var(--uid-font-body); line-height: var(--uid-line-body); min-height: var(--uid-control-xs); }
.uid-segmented { display: inline-flex; align-items: center; gap: var(--uid-space-1); padding: var(--uid-space-1); border-radius: var(--uid-radius-sm); background: var(--uid-color-hover); }
.uid-segment { display: inline-flex; align-items: center; justify-content: center; gap: var(--uid-space-2); height: var(--uid-control-xs); min-width: var(--uid-control-xs); padding-inline: var(--uid-space-4); border: 0; border-radius: var(--uid-radius-xs); background: transparent; color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); cursor: pointer; white-space: nowrap; }
.uid-segment:hover { color: var(--uid-color-text); }
.uid-segment.is-active { background: var(--uid-color-bg); color: var(--uid-color-text); box-shadow: var(--uid-shadow-card); }
.uid-align-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--uid-space-1); padding: var(--uid-space-2); border-radius: var(--uid-radius-sm); background: var(--uid-color-hover); }
.uid-align-grid .uid-iconbtn { width: 100%; height: var(--uid-control-xs); }
.uid-selection-head { display: flex; align-items: center; gap: var(--uid-space-4); padding: var(--uid-space-7) var(--uid-space-8) var(--uid-space-5); border-bottom: var(--uid-border-width) solid var(--uid-color-border); }
.uid-selection-icon { width: var(--uid-space-11); height: var(--uid-space-11); flex: none; display: flex; align-items: center; justify-content: center; border-radius: var(--uid-radius-sm); color: var(--uid-color-accent); background: var(--uid-color-accent-soft); }
.uid-selection-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--uid-space-1); }
.uid-selection-type { font-size: var(--uid-font-title); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-title); }
.uid-selection-id { font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); color: var(--uid-color-text-3); letter-spacing: 0.04em; }
.uid-selection-head + .uid-field { margin: var(--uid-space-6) var(--uid-space-8) 0; }
.uid-selection-head ~ .uid-inline-actions { padding: var(--uid-space-5) var(--uid-space-8) 0; }
.uid-selection-head ~ .uid-section { margin-top: 0; }
.uid-meta-card { display: flex; flex-direction: column; gap: var(--uid-space-3); padding: var(--uid-space-5); border-radius: var(--uid-radius-sm); background: var(--uid-color-hover); }
.uid-meta-row { display: flex; justify-content: space-between; gap: var(--uid-space-5); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); }
.uid-meta-row code, .uid-meta-row span:last-child { color: var(--uid-color-text-2); font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); max-width: 62%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uid-meta-note { margin: var(--uid-space-2) 0 0; color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-body); }
.uid-ratio-pill { font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); color: var(--uid-color-text-3); background: var(--uid-color-hover); padding: var(--uid-space-1) var(--uid-space-3); border-radius: var(--uid-radius-pill); }
.uid-inspector-subhead { display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-3); margin-top: var(--uid-space-1); }
.uid-inspector-subhead > span { color: var(--uid-color-text-3); font-size: var(--uid-font-caption); }
.uid-image-picker { display: flex; align-items: center; gap: var(--uid-space-5); }
.uid-image-picker img, .uid-image-empty { width: var(--uid-image-thumb-width); height: var(--uid-image-thumb-height); flex: none; object-fit: cover; border-radius: var(--uid-radius-sm); border: var(--uid-border-width) solid var(--uid-color-border); background: var(--uid-color-hover); display: flex; align-items: center; justify-content: center; color: var(--uid-color-text-3); }
.uid-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--uid-space-3); text-align: center; padding: var(--uid-space-12) var(--uid-space-9); color: var(--uid-color-text-3); }
.uid-empty-title { color: var(--uid-color-text-2); font-size: var(--uid-font-title); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-title); }
.uid-empty-text { font-size: var(--uid-font-body); line-height: var(--uid-line-body); max-width: var(--uid-empty-text-max-width); }

/* ── home / launcher ─────────────────────────────────────────────────── */
.uid-start { flex: 1; min-height: 0; overflow: auto; background: var(--uid-color-bg); scrollbar-gutter: stable; }
.uid-start-inner { width: 100%; max-width: var(--uid-start-max); margin: 0 auto; padding: var(--uid-space-11) var(--uid-space-11) var(--uid-start-padding-block-end); }
.uid-home-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--uid-space-10);
  padding-bottom: var(--uid-space-8);
  border-bottom: var(--uid-border-width) solid var(--uid-color-border);
}
.uid-home-heading { min-width: 0; }
.uid-home-kicker {
  display: inline-flex;
  align-items: center;
  gap: var(--uid-space-3);
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  font-weight: var(--uid-weight-semibold);
  line-height: var(--uid-line-caption);
  letter-spacing: 0.13em;
}
.uid-home-kicker-dot {
  width: var(--uid-space-3);
  height: var(--uid-space-3);
  border-radius: var(--uid-radius-pill);
  background: var(--uid-color-accent);
  box-shadow: 0 0 0 var(--uid-space-1) var(--uid-color-accent-soft);
}
.uid-home-heading h1 {
  margin: var(--uid-space-3) 0 var(--uid-space-1);
  font-size: clamp(var(--uid-font-heading), 2.6vw, calc(var(--dsw-font-xl-24-font-size) * 1.6));
  line-height: 1.16;
  letter-spacing: -0.035em;
  font-weight: var(--uid-weight-semibold);
}
.uid-home-heading p {
  margin: 0;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-body);
  line-height: var(--uid-line-body);
}
.uid-home-workspace {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--uid-space-2);
  width: min(100%, var(--uid-home-workspace-width));
  min-width: 0;
}
.uid-home-workspace-card {
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  min-width: 0;
  min-height: var(--uid-control-lg);
  padding: var(--uid-space-1) var(--uid-space-1) var(--uid-space-1) var(--uid-space-3);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-md);
  background: var(--uid-color-card);
}
.uid-home-workspace-icon {
  flex: none;
  width: var(--uid-space-11);
  height: var(--uid-space-11);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-hover);
  color: var(--uid-color-text-3);
}
.uid-home-workspace-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--uid-space-1); }
.uid-home-workspace-label { color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); }
.uid-home-workspace-picker { display: flex; align-items: center; gap: var(--uid-space-1); min-width: 0; color: var(--uid-color-text-3); }
.uid-home-workspace-picker select {
  min-width: 0;
  width: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  appearance: none;
  background: transparent;
  color: var(--uid-color-text);
  font-size: var(--uid-font-label);
  font-weight: var(--uid-weight-semibold);
  line-height: var(--uid-line-label);
  text-overflow: ellipsis;
  cursor: pointer;
}
.uid-home-refresh {
  flex: none;
  align-self: stretch;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--uid-space-1);
  min-width: var(--uid-home-refresh-height);
  padding-inline: var(--uid-space-2);
  border: 0;
  border-radius: var(--uid-radius-sm);
  background: transparent;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
  cursor: pointer;
}
.uid-home-refresh:hover { color: var(--uid-color-text); background: var(--uid-color-hover); }
.uid-home-workspace-path {
  display: block;
  min-width: 0;
  padding-inline: var(--uid-space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--uid-color-text-4);
  font-family: var(--uid-font-mono);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
}
.uid-home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) minmax(var(--uid-home-side-min), 0.68fr);
  align-items: start;
  gap: var(--uid-space-5);
  margin-top: var(--uid-space-8);
}
.uid-home-panel {
  min-width: 0;
  padding: var(--uid-home-panel-padding);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-lg);
  background: var(--uid-color-card);
}
.uid-home-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--uid-space-5);
  margin-bottom: var(--uid-space-4);
}
.uid-home-section-head h2 {
  margin: 0;
  font-size: var(--uid-font-heading);
  line-height: var(--uid-line-heading);
  letter-spacing: -0.02em;
  font-weight: var(--uid-weight-semibold);
}
.uid-home-section-head p {
  margin: var(--uid-space-1) 0 0;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-label);
  line-height: var(--uid-line-body);
}
.uid-home-count {
  flex: none;
  display: inline-flex;
  align-items: center;
  height: var(--uid-space-10);
  padding-inline: var(--uid-space-3);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-pill);
  background: var(--uid-color-bg);
  color: var(--uid-color-text-3);
  font-family: var(--uid-font-mono);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
  white-space: nowrap;
}
.uid-device-tabs {
  display: flex;
  align-items: center;
  gap: var(--uid-space-1);
  margin-bottom: var(--uid-space-4);
  padding: var(--uid-space-1);
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-hover);
  overflow-x: auto;
  scrollbar-width: none;
}
.uid-device-tabs::-webkit-scrollbar { display: none; }
.uid-device-tab {
  flex: 1 1 auto;
  height: var(--uid-home-refresh-height);
  padding-inline: var(--uid-space-3);
  border: 0;
  border-radius: var(--uid-radius-xs);
  background: transparent;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
  white-space: nowrap;
  cursor: pointer;
}
.uid-device-tab:hover { color: var(--uid-color-text); }
.uid-device-tab.is-active {
  background: var(--uid-color-bg);
  color: var(--uid-color-text);
  font-weight: var(--uid-weight-semibold);
  box-shadow: var(--uid-shadow-card);
}
.uid-new-panel { display: flex; flex-direction: column; container-type: inline-size; container-name: uid-new-panel; }
.uid-size-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--uid-space-3); }
@container uid-new-panel (min-width: 680px) {
  .uid-size-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.uid-size-card {
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  min-width: 0;
  min-height: var(--uid-home-size-min);
  padding: var(--uid-space-2) var(--uid-space-3);
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-md);
  background: var(--uid-color-bg);
  color: var(--uid-color-text);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--uid-duration-fast) var(--uid-ease), background var(--uid-duration-fast) var(--uid-ease), box-shadow var(--uid-duration-fast) var(--uid-ease);
}
.uid-size-card:hover {
  border-color: color-mix(in srgb, var(--uid-color-accent) 38%, var(--uid-color-border));
  background: var(--uid-color-accent-softer);
  box-shadow: var(--uid-shadow-soft);
}
.uid-size-preview {
  flex: none;
  width: var(--uid-home-size-preview-width);
  height: var(--uid-home-size-preview-height);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: var(--uid-border-width) solid var(--uid-color-border-subtle);
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-stage);
}
.uid-size-page {
  position: relative;
  flex: none;
  overflow: hidden;
  box-shadow: 0 0 0 var(--uid-hairline) color-mix(in srgb, var(--uid-color-text) 18%, transparent);
}
.uid-size-page-notch {
  position: absolute;
  left: 50%;
  top: var(--uid-home-size-notch-top);
  width: 34%;
  height: var(--uid-home-size-notch-height);
  transform: translateX(-50%);
  border-radius: var(--uid-radius-pill);
  background: color-mix(in srgb, var(--uid-color-text) 40%, transparent);
  opacity: 0.55;
}
.uid-size-page-bar {
  position: absolute;
  inset: 0 0 auto;
  height: var(--uid-home-size-bar-height);
  background: color-mix(in srgb, var(--uid-color-text) 12%, transparent);
}
.uid-size-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--uid-space-1); }
.uid-size-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--uid-font-label);
  font-weight: var(--uid-weight-semibold);
  line-height: var(--uid-line-label);
}
.uid-size-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
}
.uid-template-jump {
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  width: 100%;
  margin-top: var(--uid-space-4);
  padding: var(--uid-space-2) var(--uid-space-3);
  border: var(--uid-border-width) solid var(--uid-color-border-subtle);
  border-radius: var(--uid-radius-md);
  background: var(--uid-color-hover);
  color: var(--uid-color-text);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--uid-duration-fast) var(--uid-ease), background var(--uid-duration-fast) var(--uid-ease);
}
.uid-template-jump-icon {
  flex: none;
  width: var(--uid-space-11);
  height: var(--uid-space-11);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-accent-soft);
  color: var(--uid-color-accent);
}
.uid-template-jump-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; }
.uid-template-jump-copy strong { font-size: var(--uid-font-label); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-label); }
.uid-template-jump-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-body);
}
.uid-template-jump-arrow { flex: none; color: var(--uid-color-text-3); }
.uid-template-jump:hover { border-color: color-mix(in srgb, var(--uid-color-accent) 32%, var(--uid-color-border)); background: var(--uid-color-accent-softer); }
.uid-template-jump:hover .uid-template-jump-arrow { color: var(--uid-color-accent); }
.uid-recent-panel { display: flex; flex-direction: column; }
.uid-recent-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--uid-space-3);
  margin-bottom: var(--uid-space-3);
}
.uid-recent-title { flex: 1; display: flex; align-items: center; gap: var(--uid-space-2); min-width: 0; }
.uid-recent-title h2 {
  margin: 0;
  font-size: var(--uid-font-heading);
  line-height: var(--uid-line-heading);
  letter-spacing: -0.02em;
  font-weight: var(--uid-weight-semibold);
  white-space: nowrap;
}
.uid-home-search {
  flex: none;
  width: var(--uid-home-search-width);
  height: var(--uid-home-refresh-height);
  margin: 0;
  padding-inline: var(--uid-space-3);
}
.uid-home-search input { font-size: var(--uid-font-caption); }
.uid-recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--uid-space-1);
  max-height: var(--uid-home-recent-max-height);
  overflow: auto;
  margin-inline: calc(var(--uid-space-2) * -1);
  padding-inline: var(--uid-space-2);
  scrollbar-width: thin;
}
.uid-recent-row {
  display: flex;
  align-items: center;
  gap: var(--uid-space-1);
  min-width: 0;
  border-radius: var(--uid-radius-sm);
  transition: background var(--uid-duration-fast) var(--uid-ease);
}
.uid-recent-row:hover { background: var(--uid-color-hover); }
.uid-recent-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--uid-space-3);
  min-width: 0;
  padding: var(--uid-space-2);
  border: 0;
  border-radius: var(--uid-radius-sm);
  background: transparent;
  color: var(--uid-color-text);
  text-align: left;
  cursor: pointer;
}
.uid-recent-thumb {
  flex: none;
  width: var(--uid-home-recent-thumb-width);
  height: var(--uid-home-recent-thumb-height);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: var(--uid-border-width) solid var(--uid-color-border-subtle);
  border-radius: var(--uid-radius-sm);
  background: var(--uid-color-stage);
}
.uid-recent-page { flex: none; box-shadow: 0 0 0 var(--uid-hairline) color-mix(in srgb, var(--uid-color-text) 16%, transparent); }
.uid-recent-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--uid-space-1); }
.uid-recent-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--uid-font-label);
  font-weight: var(--uid-weight-semibold);
  line-height: var(--uid-line-label);
}
.uid-recent-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
}
.uid-recent-open {
  flex: none;
  color: var(--uid-color-text-4);
  opacity: 0;
  transform: translateX(calc(var(--uid-space-1) * -1));
  transition: opacity var(--uid-duration-fast) var(--uid-ease), transform var(--uid-duration-fast) var(--uid-ease);
}
.uid-recent-row:hover .uid-recent-open { opacity: 1; transform: none; }
.uid-recent-actions { flex: none; display: flex; align-items: center; gap: var(--uid-space-1); padding-inline-end: var(--uid-space-1); opacity: 0.55; }
.uid-recent-row:hover .uid-recent-actions,
.uid-recent-actions:focus-within { opacity: 1; }
.uid-recent-actions .uid-iconbtn { width: var(--uid-control-xs); height: var(--uid-control-xs); }
.uid-recent-actions .uid-link { font-size: var(--uid-font-caption); white-space: nowrap; }
.uid-recent-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--uid-space-2);
  min-height: var(--uid-home-empty-min-height);
  padding: var(--uid-space-9) var(--uid-space-6);
  border: var(--uid-border-width) dashed var(--uid-color-border-strong);
  border-radius: var(--uid-radius-md);
  color: var(--uid-color-text-3);
  text-align: center;
}
.uid-recent-empty.is-search { min-height: var(--uid-home-empty-min-height-search); }
.uid-recent-empty-icon {
  width: var(--uid-space-11);
  height: var(--uid-space-11);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--uid-space-1);
  border-radius: var(--uid-radius-md);
  background: var(--uid-color-hover);
  color: var(--uid-color-text-3);
}
.uid-recent-empty strong { color: var(--uid-color-text-2); font-size: var(--uid-font-label); line-height: var(--uid-line-label); }
.uid-recent-empty > span:last-child { max-width: var(--uid-home-empty-text-max); font-size: var(--uid-font-caption); line-height: var(--uid-line-body); }
.uid-recent-foot {
  display: flex;
  align-items: center;
  gap: var(--uid-space-1);
  margin-top: auto;
  padding-top: var(--uid-space-3);
  border-top: var(--uid-border-width) solid var(--uid-color-border-subtle);
  color: var(--uid-color-text-4);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-body);
}
.uid-recent-foot span { min-width: 0; }
.uid-recent-foot code {
  padding: 0 var(--uid-space-1);
  border-radius: var(--uid-radius-xs);
  background: var(--uid-color-hover);
  font-family: var(--uid-font-mono);
  font-size: var(--uid-font-caption);
}
.uid-home-templates { margin-top: var(--uid-space-11); scroll-margin-top: var(--uid-space-4); }
.uid-home-section-head.is-templates { align-items: flex-end; margin-bottom: var(--uid-space-4); }
.uid-home-templates .uid-home-section-head h2 { font-size: var(--uid-font-display); }
.uid-filter-tabs { display: flex; gap: var(--uid-space-1); padding: var(--uid-space-1); border-radius: var(--uid-radius-sm); background: var(--uid-color-hover); }
.uid-filter { height: var(--uid-control-sm); padding-inline: var(--uid-space-5); border: 0; border-radius: var(--uid-radius-xs); background: transparent; color: var(--uid-color-text-3); font-size: var(--uid-font-label); line-height: var(--uid-line-label); cursor: pointer; }
.uid-filter:hover { color: var(--uid-color-text); }
.uid-filter.is-active { background: var(--uid-color-bg); color: var(--uid-color-text); box-shadow: var(--uid-shadow-card); }
.uid-template-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(var(--uid-home-template-min), 1fr)); gap: var(--uid-space-4); }
.uid-template-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: var(--uid-border-width) solid var(--uid-color-border);
  border-radius: var(--uid-radius-md);
  background: var(--uid-color-card);
  color: var(--uid-color-text);
  text-align: left;
  cursor: pointer;
  transition: transform var(--uid-duration) var(--uid-ease), box-shadow var(--uid-duration) var(--uid-ease), border-color var(--uid-duration) var(--uid-ease);
}
.uid-template-card:hover { transform: translateY(calc(var(--uid-space-1) * -1)); border-color: color-mix(in srgb, var(--uid-color-accent) 34%, var(--uid-color-border)); box-shadow: var(--uid-shadow-soft); }
.uid-template-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: var(--uid-template-thumb-height);
  overflow: hidden;
  background: var(--uid-color-stage);
  background-image: radial-gradient(circle at var(--uid-hairline) var(--uid-hairline), var(--uid-color-grid) var(--uid-hairline), transparent 0);
  background-size: var(--uid-space-7) var(--uid-space-7);
}
.uid-template-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: var(--uid-space-6) var(--uid-space-5);
  object-fit: contain;
  filter: drop-shadow(0 var(--uid-space-2) var(--uid-space-4) color-mix(in srgb, var(--uid-color-text) 14%, transparent));
}
.uid-template-fallback { color: var(--uid-color-text-3); }
.uid-template-body { display: flex; flex-direction: column; gap: var(--uid-space-1); min-width: 0; padding: var(--uid-space-3) var(--uid-space-4) var(--uid-space-4); }
.uid-template-title { font-size: var(--uid-font-label); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-label); }
.uid-template-desc {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--uid-color-text-3);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-body);
}
.uid-template-arrow {
  position: absolute;
  right: var(--uid-space-3);
  bottom: var(--uid-space-3);
  color: var(--uid-color-text-3);
  opacity: 0;
  transform: translateX(calc(var(--uid-space-1) * -1));
  transition: opacity var(--uid-duration) var(--uid-ease), transform var(--uid-duration) var(--uid-ease);
}
.uid-template-card:hover .uid-template-arrow { opacity: 1; transform: none; }
.uid-template-grid.is-modal { grid-template-columns: repeat(3, 1fr); }
.uid-template-card.is-compact .uid-template-thumb { height: var(--uid-template-thumb-height-compact); }
.uid-design-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--uid-space-5); }
.uid-design-card { position: relative; display: flex; align-items: center; gap: var(--uid-space-4); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-md); background: var(--uid-color-card); overflow: hidden; transition: border-color var(--uid-duration-fast) var(--uid-ease), box-shadow var(--uid-duration-fast) var(--uid-ease); }
.uid-design-card:hover { border-color: color-mix(in srgb, var(--uid-color-accent) 34%, var(--uid-color-border)); box-shadow: var(--uid-shadow-soft); }
.uid-design-main { display: flex; align-items: center; gap: var(--uid-space-6); flex: 1; min-width: 0; padding: var(--uid-space-4); border: 0; background: transparent; color: var(--uid-color-text); text-align: left; cursor: pointer; }
.uid-design-thumb { position: relative; width: var(--uid-design-thumb-width); height: var(--uid-design-thumb-height); flex: none; display: flex; align-items: center; justify-content: center; border-radius: var(--uid-radius-sm); box-shadow: inset 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--uid-color-bg) 14%, transparent); overflow: hidden; }
.uid-design-thumb-inner { width: var(--uid-space-11); height: var(--uid-space-11); display: flex; align-items: center; justify-content: center; border-radius: var(--uid-radius-sm); background: color-mix(in srgb, var(--uid-color-text) 24%, transparent); color: var(--uid-color-on-accent); backdrop-filter: var(--dsw-menu-backdrop-filter); }
.uid-design-dims { position: absolute; left: var(--uid-space-1); bottom: var(--uid-space-1); font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); color: color-mix(in srgb, var(--dsw-static-neutral-00) 82%, transparent); background: color-mix(in srgb, var(--uid-color-text) 48%, transparent); padding: 0 var(--uid-space-1); border-radius: var(--uid-radius-xs); }
.uid-design-info { display: flex; flex-direction: column; gap: var(--uid-space-1); min-width: 0; }
.uid-design-title { font-size: var(--uid-font-body); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uid-design-meta { color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uid-design-file { color: var(--uid-color-text-4); font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uid-design-actions { flex: none; padding-inline-end: var(--uid-space-3); display: flex; align-items: center; gap: var(--uid-space-1); }
.uid-design-grid.is-modal { grid-template-columns: repeat(2, 1fr); }
.uid-loading-row { display: flex; align-items: center; gap: var(--uid-space-4); padding: var(--uid-space-10) 0; color: var(--uid-color-text-3); font-size: var(--uid-font-label); line-height: var(--uid-line-label); }
.uid-start-footer {
  display: flex;
  align-items: center;
  gap: var(--uid-space-5);
  margin-top: var(--uid-space-11);
  padding-top: var(--uid-space-6);
  border-top: var(--uid-border-width) solid var(--uid-color-border);
  color: var(--uid-color-text-4);
  font-size: var(--uid-font-caption);
  line-height: var(--uid-line-caption);
}
.uid-start-footer-brand { display: inline-flex; align-items: center; gap: var(--uid-space-2); color: var(--uid-color-text-3); }
.uid-start-footer-right { margin-inline-start: auto; }

.uid-boot { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--uid-space-6); color: var(--uid-color-text-3); font-size: var(--uid-font-body); background: var(--uid-color-stage); }
.uid-boot-mark { margin-bottom: var(--uid-space-2); }
.uid-error-banner { flex: none; display: flex; align-items: center; gap: var(--uid-space-4); padding: var(--uid-space-4) var(--uid-space-7); background: var(--uid-color-danger-soft); border-bottom: var(--uid-border-width) solid var(--uid-color-danger-line); color: var(--uid-color-danger); font-size: var(--uid-font-label); line-height: var(--uid-line-label); }
.uid-error-banner span { flex: 1; }
.uid-offline-pill { position: absolute; right: var(--uid-space-7); top: calc(var(--uid-topbar-height) + var(--uid-space-4)); z-index: var(--uid-z-floating); display: flex; align-items: center; gap: var(--uid-space-2); padding: var(--uid-space-2) var(--uid-space-4); border-radius: var(--uid-radius-pill); background: var(--uid-color-danger-soft); color: var(--uid-color-danger); border: var(--uid-border-width) solid var(--uid-color-danger-line); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); }

/* ── modals ──────────────────────────────────────────────────────────── */
.uid-modal-backdrop {
  position: absolute;
  inset: 0;
  z-index: var(--uid-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--uid-space-9);
  background: var(--uid-color-mask);
  backdrop-filter: var(--uid-blur-scrim);
  animation: uid-fade var(--uid-duration-fast) var(--uid-ease);
}
@keyframes uid-fade { from { opacity: 0; } }
.uid-modal {
  max-width: calc(100% - var(--uid-space-5));
  max-height: min(88vh, var(--uid-modal-max-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: var(--uid-border-width) solid var(--uid-color-border-strong);
  border-radius: var(--uid-radius-lg);
  background: var(--uid-color-card);
  box-shadow: var(--uid-shadow-prominent);
  animation: uid-modal-in var(--uid-duration) var(--uid-ease);
}
@keyframes uid-modal-in { from { opacity: 0; transform: translateY(var(--uid-space-4)) scale(0.985); } }
.uid-library-modal { width: var(--uid-modal-library-width); }
.uid-export-modal { width: var(--uid-modal-export-width); }
.uid-modal-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-5); min-height: var(--uid-panel-head-height); padding-inline: var(--uid-space-9) var(--uid-space-8); border-bottom: var(--uid-border-width) solid var(--uid-color-border); }
.uid-modal-title { display: flex; align-items: center; gap: var(--uid-space-4); font-size: var(--uid-font-title); font-weight: var(--uid-weight-semibold); line-height: var(--uid-line-title); }
.uid-modal-tabs { flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-6); padding: var(--uid-space-5) var(--uid-space-9); border-bottom: var(--uid-border-width) solid var(--uid-color-border); }
.uid-modal-body { flex: 1; min-height: 0; overflow: auto; padding: var(--uid-space-8) var(--uid-space-9); scrollbar-gutter: stable; }
.uid-modal-workspace { display: flex; align-items: center; gap: var(--uid-space-4); margin-top: var(--uid-space-8); padding-top: var(--uid-space-6); border-top: var(--uid-border-width) solid var(--uid-color-border); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); flex-wrap: wrap; }
.uid-modal-workspace code { font-family: var(--uid-font-mono); background: var(--uid-color-hover); padding: var(--uid-space-1) var(--uid-space-3); border-radius: var(--uid-radius-xs); font-size: var(--uid-font-caption); max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uid-modal-workspace .uid-link { margin-inline-start: auto; }
.uid-workspace-select { width: auto; min-width: var(--uid-modal-workspace-select-min-width); max-width: var(--uid-modal-workspace-select-max-width); height: var(--uid-control-sm); font-size: var(--uid-font-caption); margin-inline-start: auto; }
.uid-modal-workspace .uid-link { margin-inline-start: 0; }
.uid-export-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 1.04fr 0.96fr; overflow: auto; }
.uid-export-preview { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--uid-space-4); padding: var(--uid-space-10); background: var(--uid-color-stage); border-inline-end: var(--uid-border-width) solid var(--uid-color-border); min-height: var(--uid-export-preview-min-height); }
.uid-export-checker {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: var(--uid-export-preview-max-height);
  padding: var(--uid-space-5);
  border-radius: var(--uid-radius-sm);
  background-color: var(--uid-color-checker-bg);
  background-image:
    linear-gradient(45deg, var(--uid-color-checker) 25%, transparent 25%),
    linear-gradient(-45deg, var(--uid-color-checker) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--uid-color-checker) 75%),
    linear-gradient(-45deg, transparent 75%, var(--uid-color-checker) 75%);
  background-size: var(--uid-space-8) var(--uid-space-8);
  background-position: 0 0, 0 var(--uid-space-4), var(--uid-space-4) calc(var(--uid-space-4) * -1), calc(var(--uid-space-4) * -1) 0;
  box-shadow: var(--uid-shadow-soft);
}
.uid-export-checker img { display: block; max-width: var(--uid-export-image-max-width); max-height: var(--uid-export-image-max-height); }
.uid-export-dims { font-family: var(--uid-font-mono); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); }
.uid-export-form { display: flex; flex-direction: column; gap: var(--uid-space-6); padding: var(--uid-space-10); }
.uid-export-label { color: var(--uid-color-text-3); font-size: var(--uid-font-caption); font-weight: var(--uid-weight-semibold); letter-spacing: 0.06em; text-transform: uppercase; line-height: var(--uid-line-caption); }
.uid-format-cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--uid-space-3); }
.uid-format-card { display: flex; align-items: center; gap: var(--uid-space-4); padding: var(--uid-space-4); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: var(--uid-color-bg); color: var(--uid-color-text); text-align: left; cursor: pointer; transition: border-color var(--uid-duration-fast) var(--uid-ease), box-shadow var(--uid-duration-fast) var(--uid-ease); }
.uid-format-card:hover { border-color: var(--uid-color-border-strong); }
.uid-format-card.is-active { border-color: var(--uid-color-accent); box-shadow: 0 0 0 var(--uid-space-1) var(--uid-color-accent-soft); }
.uid-format-icon { width: var(--uid-space-11); height: var(--uid-space-11); flex: none; display: flex; align-items: center; justify-content: center; border-radius: var(--uid-radius-sm); color: var(--uid-color-accent); background: var(--uid-color-accent-soft); }
.uid-format-card strong { display: block; font-size: var(--uid-font-label); line-height: var(--uid-line-label); }
.uid-format-card small { display: block; color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); margin-top: var(--uid-space-1); }
.uid-scale-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--uid-space-2); }
.uid-scale-chip { display: flex; flex-direction: column; gap: var(--uid-space-1); align-items: center; padding: var(--uid-space-3) var(--uid-space-1); border: var(--uid-border-width) solid var(--uid-color-border); border-radius: var(--uid-radius-sm); background: var(--uid-color-bg); color: var(--uid-color-text-2); cursor: pointer; }
.uid-scale-chip:hover { border-color: var(--uid-color-border-strong); }
.uid-scale-chip.is-active { border-color: var(--uid-color-accent); background: var(--uid-color-accent-soft); color: var(--uid-color-accent); }
.uid-scale-chip strong { font-size: var(--uid-font-label); line-height: var(--uid-line-label); }
.uid-scale-chip small { font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); opacity: 0.75; }
.uid-export-toggle { padding-top: var(--uid-space-3); border-top: var(--uid-border-width) solid var(--uid-color-border); }
.uid-export-note { display: flex; align-items: flex-start; gap: var(--uid-space-2); color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-body); }
.uid-export-note code { font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); word-break: break-all; background: var(--uid-color-hover); padding: 0 var(--uid-space-1); border-radius: var(--uid-radius-xs); }
.uid-export-actions { display: flex; justify-content: flex-end; gap: var(--uid-space-3); margin-top: auto; padding-top: var(--uid-space-5); }
.uid-export-error { padding: var(--uid-space-3) var(--uid-space-4); border-radius: var(--uid-radius-sm); background: var(--uid-color-danger-soft); color: var(--uid-color-danger); font-size: var(--uid-font-caption); line-height: var(--uid-line-body); }
.uid-export-result { display: flex; align-items: center; gap: var(--uid-space-2); padding: var(--uid-space-3) var(--uid-space-4); border-radius: var(--uid-radius-sm); background: color-mix(in srgb, var(--uid-color-success) 12%, transparent); color: var(--uid-color-success); font-size: var(--uid-font-caption); }
.uid-export-result code { font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); word-break: break-all; }

/* ── preview ─────────────────────────────────────────────────────────── */
.uid-preview-overlay { position: absolute; inset: 0; z-index: var(--uid-z-preview); display: flex; flex-direction: column; background: radial-gradient(ellipse at 50% 20%, var(--dsw-static-neutral-900), var(--dsw-static-neutral-1000) 70%); color: var(--uid-color-ink); animation: uid-fade var(--uid-duration-fast) var(--uid-ease); }
.uid-preview-bar { flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--uid-space-6); height: var(--uid-topbar-height); padding-inline: var(--uid-space-8); border-bottom: var(--uid-border-width) solid var(--uid-color-ink-line); background: var(--uid-color-ink-panel); backdrop-filter: var(--dsw-menu-backdrop-filter); }
.uid-preview-title { display: flex; align-items: center; gap: var(--uid-space-4); font-size: var(--uid-font-title); font-weight: var(--uid-weight-semibold); min-width: 0; }
.uid-preview-title span:not(.uid-preview-dims) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uid-preview-dims { font-family: var(--uid-font-mono); font-size: var(--uid-font-caption); color: var(--uid-color-ink-faint); background: color-mix(in srgb, var(--dsw-static-neutral-00) 8%, transparent); padding: 0 var(--uid-space-2); border-radius: var(--uid-radius-xs); }
.uid-preview-actions { display: flex; align-items: center; gap: var(--uid-space-5); }
.uid-preview-hint { font-size: var(--uid-font-caption); color: var(--uid-color-ink-faint); }
.uid-preview-bar .uid-btn-quiet { color: var(--uid-color-ink); border-color: var(--uid-color-ink-line); background: color-mix(in srgb, var(--dsw-static-neutral-00) 6%, transparent); }
.uid-preview-stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: auto; padding: var(--uid-space-11); background-image: radial-gradient(circle at var(--uid-hairline) var(--uid-hairline), var(--uid-color-ink-line) var(--uid-hairline), transparent 0); background-size: var(--uid-stage-grid) var(--uid-stage-grid); }
.uid-preview-device { background: var(--dsw-static-neutral-1000); box-shadow: var(--uid-shadow-menu), inset 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--dsw-static-neutral-00) 16%, transparent); }
.uid-preview-device.is-wearable { box-shadow: var(--uid-shadow-menu), inset 0 0 0 var(--uid-border-width) color-mix(in srgb, var(--dsw-static-neutral-00) 22%, transparent), 0 0 0 var(--uid-space-2) color-mix(in srgb, var(--dsw-static-neutral-00) 4%, transparent); }
.uid-preview-screen { position: relative; }
.uid-preview-foot { flex: none; display: flex; align-items: center; justify-content: center; gap: var(--uid-space-3); height: var(--uid-space-12); color: var(--uid-color-ink-faint); font-size: var(--uid-font-caption); border-top: var(--uid-border-width) solid color-mix(in srgb, var(--dsw-static-neutral-00) 6%, transparent); }

/* ── toast ───────────────────────────────────────────────────────────── */
.uid-toast { position: absolute; left: 50%; bottom: var(--uid-space-10); transform: translateX(-50%); z-index: var(--uid-z-toast); display: flex; align-items: center; gap: var(--uid-space-3); max-width: min(var(--uid-toast-max-width), calc(100% - var(--uid-space-9))); padding: var(--uid-space-4) var(--uid-space-4) var(--uid-space-4) var(--uid-space-5); border-radius: var(--uid-radius-sm); background: var(--uid-color-toast); color: var(--uid-color-toast-text); font-size: var(--uid-font-body); line-height: var(--uid-line-body); box-shadow: var(--uid-shadow-prominent); animation: uid-toast-in var(--uid-duration) var(--uid-ease); }
@keyframes uid-toast-in { from { opacity: 0; transform: translate(-50%, var(--uid-space-3)); } }
.uid-toast.is-error { background: color-mix(in srgb, var(--uid-color-danger) 80%, var(--dsw-static-neutral-1000)); }
.uid-toast.is-info { background: var(--uid-color-tooltip); }
.uid-toast span { flex: 1; }
.uid-toast-close { flex: none; width: var(--uid-space-10); height: var(--uid-space-10); display: flex; align-items: center; justify-content: center; border: 0; border-radius: var(--uid-radius-xs); background: transparent; color: color-mix(in srgb, var(--uid-color-toast-text) 70%, transparent); cursor: pointer; }
.uid-toast-close:hover { background: color-mix(in srgb, var(--uid-color-toast-text) 14%, transparent); color: var(--uid-color-toast-text); }

/* ── mobile / compact ────────────────────────────────────────────────── */
.uid-mobile-toolbar { display: none; }
.uid-mobile-scrim { display: none; }
.uid-root.is-compact .uid-desktop-only,
.uid-root.is-compact .uid-desktop-only-inline { display: none !important; }
.uid-root.is-compact .uid-topbar { height: var(--uid-topbar-height); padding-inline: calc(var(--uid-space-4) + var(--uid-safe-inline)) var(--uid-space-4); gap: var(--uid-space-4); }
.uid-root.is-compact .uid-brand { display: none; }
.uid-root.is-compact .uid-topbar-divider { display: none; }
.uid-root.is-compact .uid-topbar.is-home .uid-brand { display: inline-flex; }
.uid-root.is-compact .uid-topbar.is-home .uid-topbar-divider { display: block; }
.uid-root.is-compact .uid-topbar.is-home .uid-topbar-context { flex: 1; }
.uid-root.is-compact .uid-title-input { font-size: var(--uid-font-title); }
.uid-root.is-compact .uid-save-state { font-size: var(--uid-font-caption); }
.uid-root.is-compact .uid-save-btn { height: var(--uid-control-sm); padding-inline: var(--uid-space-4); }
.uid-root.is-compact .uid-save-btn .uid-btn-label { display: none; }
.uid-root.is-compact .uid-topbar-actions { gap: var(--uid-space-2); }
.uid-root.is-compact .uid-history-group { display: flex; }
.uid-root.is-compact .uid-history-group .uid-iconbtn { width: var(--uid-control-sm); height: var(--uid-control-sm); }
.uid-root.is-compact .uid-workspace-pick { display: none; }
.uid-root.is-compact .uid-file-btn { height: var(--uid-control-sm); padding-inline: var(--uid-space-4); }
.uid-root.is-compact .uid-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--uid-mobile-rail);
  z-index: var(--uid-z-mobile-rail);
  transform: translateX(-102%);
  transition: transform var(--uid-duration-slow) var(--uid-ease);
  box-shadow: var(--uid-shadow-menu);
}
.uid-root.is-compact .uid-inspector-rail {
  left: auto;
  right: 0;
  width: var(--uid-mobile-inspector);
  transform: translateX(102%);
  border-inline-start: var(--uid-border-width) solid var(--uid-color-border);
  box-shadow: var(--uid-shadow-menu);
}
.uid-root.is-compact .uid-rail.is-mobile-open { transform: translateX(0); }
.uid-root.is-compact .uid-panel-scroll { padding-bottom: var(--uid-space-9); }
.uid-root.is-compact .uid-mobile-scrim { display: block; position: absolute; inset: 0; z-index: var(--uid-z-scrim); background: var(--uid-color-scrim); backdrop-filter: var(--uid-blur-scrim); }
.uid-root.is-compact .uid-mobile-toolbar {
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--uid-z-floating);
  height: var(--uid-mobile-bar-height);
  padding: var(--uid-space-2) var(--uid-space-3) max(var(--uid-space-2), env(safe-area-inset-bottom));
  border-top: var(--uid-border-width) solid var(--uid-color-border);
  background: color-mix(in srgb, var(--uid-color-bg) 92%, transparent);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
}
.uid-mobile-tool { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--uid-space-1); min-height: var(--uid-control-lg); border: 0; border-radius: var(--uid-radius-sm); background: transparent; color: var(--uid-color-text-3); font-size: var(--uid-font-caption); line-height: var(--uid-line-caption); cursor: pointer; }
.uid-mobile-tool:hover, .uid-mobile-tool:active { background: var(--uid-color-hover); color: var(--uid-color-text); }
.uid-root.is-compact .uid-zoombar { bottom: calc(var(--uid-mobile-bar-height) + var(--uid-space-4)); }
.uid-root.is-compact .uid-stage-tip { display: none; }
.uid-root.is-compact .uid-stage-info { top: var(--uid-space-4); left: var(--uid-space-4); }
.uid-root.is-compact .uid-start-inner { padding: var(--uid-space-7) var(--uid-space-6) calc(var(--uid-space-11) + env(safe-area-inset-bottom)); }
.uid-root.is-compact .uid-home-head { flex-direction: column; align-items: stretch; gap: var(--uid-space-5); padding-bottom: var(--uid-space-6); }
.uid-root.is-compact .uid-home-heading h1 { font-size: var(--uid-font-display); }
.uid-root.is-compact .uid-home-heading p { font-size: var(--uid-font-label); }
.uid-root.is-compact .uid-home-workspace { width: 100%; }
.uid-root.is-compact .uid-home-grid { grid-template-columns: minmax(0, 1fr); gap: var(--uid-space-3); margin-top: var(--uid-space-6); }
.uid-root.is-compact .uid-home-panel { padding: var(--uid-space-4); border-radius: var(--uid-radius-md); }
.uid-root.is-compact .uid-home-panel .uid-home-section-head h2,
.uid-root.is-compact .uid-recent-title h2 { font-size: var(--uid-font-title); }
.uid-root.is-compact .uid-size-grid { gap: var(--uid-space-2); }
.uid-root.is-compact .uid-size-card { min-height: var(--uid-home-size-min-compact); padding: var(--uid-space-2); gap: var(--uid-space-2); }
.uid-root.is-compact .uid-size-preview { width: var(--uid-home-size-preview-width-compact); height: var(--uid-home-size-preview-height-compact); }
.uid-root.is-compact .uid-home-templates { margin-top: var(--uid-space-8); }
.uid-root.is-compact .uid-home-templates .uid-template-grid { grid-template-columns: minmax(0, 1fr); gap: var(--uid-space-2); }
.uid-root.is-compact .uid-home-templates .uid-template-card { flex-direction: row; align-items: stretch; }
.uid-root.is-compact .uid-home-templates .uid-template-thumb { flex: none; width: var(--uid-home-template-thumb-width-compact); height: var(--uid-home-template-thumb-height-compact); min-height: 0; }
.uid-root.is-compact .uid-home-templates .uid-template-thumb img { padding: var(--uid-space-2); }
.uid-root.is-compact .uid-home-templates .uid-template-body { flex: 1; justify-content: center; padding: var(--uid-space-3) var(--uid-space-2); }
.uid-root.is-compact .uid-home-templates .uid-template-desc { -webkit-line-clamp: 2; }
.uid-root.is-compact .uid-home-templates .uid-template-arrow { position: static; align-self: center; margin-inline-end: var(--uid-space-3); opacity: 1; transform: none; }
.uid-root.is-compact .uid-home-section-head.is-templates { flex-direction: column; align-items: stretch; gap: var(--uid-space-3); }
.uid-root.is-compact .uid-home-section-head.is-templates .uid-filter-tabs { align-self: stretch; overflow-x: auto; scrollbar-width: none; }
.uid-root.is-compact .uid-home-section-head.is-templates .uid-filter-tabs::-webkit-scrollbar { display: none; }
.uid-root.is-compact .uid-filter { flex: 1; padding-inline: var(--uid-space-3); }
.uid-root.is-compact .uid-design-grid,
.uid-root.is-compact .uid-design-grid.is-modal { grid-template-columns: 1fr; }
.uid-root.is-compact .uid-start-footer { flex-wrap: wrap; gap: var(--uid-space-2) var(--uid-space-4); margin-top: var(--uid-space-8); }
.uid-root.is-compact .uid-start-footer-right { width: 100%; margin-inline-start: 0; }
.uid-root.is-compact .uid-modal-backdrop { padding: 0; align-items: flex-end; }
.uid-root.is-compact .uid-modal { width: 100%; max-width: 100%; max-height: 94vh; border-radius: var(--uid-radius-lg) var(--uid-radius-lg) 0 0; border-bottom: 0; }
.uid-root.is-compact .uid-library-modal { height: 92vh; }
.uid-root.is-compact .uid-export-modal { height: auto; max-height: 92vh; }
.uid-root.is-compact .uid-export-body { grid-template-columns: 1fr; }
.uid-root.is-compact .uid-export-preview { border-inline-end: 0; border-bottom: var(--uid-border-width) solid var(--uid-color-border); min-height: var(--uid-export-preview-min-height-compact); padding: var(--uid-space-8); }
.uid-root.is-compact .uid-export-checker img { max-height: var(--uid-export-image-max-height-compact); }
.uid-root.is-compact .uid-export-form { padding: var(--uid-space-8); }
.uid-root.is-compact .uid-preview-bar { height: var(--uid-preview-bar-height); padding-inline: var(--uid-space-5); }
.uid-root.is-compact .uid-preview-hint { display: none; }
.uid-root.is-compact .uid-preview-stage { padding: var(--uid-space-7); }
.uid-root.is-compact .uid-preview-foot { display: none; }
.uid-root.is-compact .uid-toast { bottom: calc(var(--uid-mobile-bar-height) + var(--uid-space-9)); }
.uid-root.is-compact .uid-topbar-context { font-size: var(--uid-font-caption); }

@container uid-root (min-width: 560px) {
  .uid-root.is-compact .uid-home-section-head.is-templates { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: var(--uid-space-5); }
  .uid-root.is-compact .uid-home-section-head.is-templates .uid-filter-tabs { flex: none; width: auto; align-self: auto; }
  .uid-root.is-compact .uid-home-templates .uid-template-grid { grid-template-columns: repeat(auto-fit, minmax(var(--uid-home-template-min), 1fr)); gap: var(--uid-space-4); }
  .uid-root.is-compact .uid-home-templates .uid-template-card { flex-direction: column; }
  .uid-root.is-compact .uid-home-templates .uid-template-thumb { width: auto; height: var(--uid-template-thumb-height); min-height: 0; }
  .uid-root.is-compact .uid-home-templates .uid-template-thumb img { padding: var(--uid-space-6) var(--uid-space-5); }
  .uid-root.is-compact .uid-home-templates .uid-template-body { flex: initial; padding: var(--uid-space-3) var(--uid-space-4) var(--uid-space-4); }
  .uid-root.is-compact .uid-home-templates .uid-template-arrow { position: absolute; right: var(--uid-space-3); bottom: var(--uid-space-3); align-self: auto; margin: 0; opacity: 0; transform: translateX(calc(var(--uid-space-1) * -1)); }
  .uid-root.is-compact .uid-home-templates .uid-template-card:hover .uid-template-arrow { opacity: 1; transform: none; }
}

@container uid-root (min-width: 820px) {
  .uid-root.is-compact .uid-home-head { flex-direction: row; align-items: flex-end; gap: var(--uid-space-12); padding-bottom: var(--uid-space-8); }
  .uid-root.is-compact .uid-home-heading h1 { font-size: clamp(var(--uid-font-heading), 2.6vw, calc(var(--dsw-font-xl-24-font-size) * 1.6)); }
  .uid-root.is-compact .uid-home-workspace { width: min(100%, var(--uid-home-workspace-width)); }
  .uid-root.is-compact .uid-home-grid { grid-template-columns: minmax(0, 1.32fr) minmax(var(--uid-home-side-min), 0.68fr); gap: var(--uid-space-4); margin-top: var(--uid-space-8); }
  .uid-root.is-compact .uid-home-panel { padding: var(--uid-home-panel-padding); border-radius: var(--uid-radius-lg); }
  .uid-root.is-compact .uid-home-panel .uid-home-section-head h2,
  .uid-root.is-compact .uid-recent-title h2 { font-size: var(--uid-font-heading); }
  .uid-root.is-compact .uid-size-card { min-height: calc(var(--uid-space-11) * 2); padding: var(--uid-space-2) var(--uid-space-3); gap: var(--uid-space-3); }
  .uid-root.is-compact .uid-size-preview { width: var(--uid-home-size-preview-width); height: var(--uid-home-size-preview-height); }
}

@container uid-root (max-width: 700px) {
  .uid-root.is-compact .uid-topbar { padding-inline-start: calc(var(--uid-space-4) + max(var(--uid-safe-inline), var(--uid-mobile-leading))); }
}

@container uid-root (max-width: 380px) {
  .uid-history-group,
  .uid-file-btn { display: none !important; }
  .uid-root.is-compact .uid-topbar { gap: var(--uid-space-2); }
  .uid-root.is-compact .uid-start-inner { padding-inline: var(--uid-space-4); }
  .uid-root.is-compact .uid-home-panel { padding: var(--uid-space-3); }
  .uid-root.is-compact .uid-home-refresh { width: var(--uid-control-sm); padding-inline: 0; }
  .uid-root.is-compact .uid-home-refresh span { display: none; }
  .uid-root.is-compact .uid-home-workspace-path { display: none; }
}

@media (max-width: 700px) {
  .uid-modal-tabs { flex-direction: column; align-items: stretch; }
  .uid-search-inline { width: 100%; }
}

/* ── misc ────────────────────────────────────────────────────────────── */
.uid-root ::-webkit-scrollbar { width: var(--dsh-scrollbar-width); height: var(--dsh-scrollbar-width); }
.uid-root ::-webkit-scrollbar-thumb { background: var(--dsh-scrollbar-thumb); border-radius: var(--uid-radius-pill); border: var(--dsh-scrollbar-thumb-border) solid transparent; background-clip: content-box; }
.uid-root ::-webkit-scrollbar-thumb:hover { background: var(--dsh-scrollbar-thumb-hover); background-clip: content-box; }
.uid-root ::-webkit-scrollbar-track { background: transparent; margin-block: var(--dsh-scrollbar-track-margin); }
`
