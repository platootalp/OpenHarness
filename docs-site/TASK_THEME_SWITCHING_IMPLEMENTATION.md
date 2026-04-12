# Theme Switching Implementation Tasks

> **Project:** OpenHarness Documentation Site
> **Date:** 2026-04-12
> **Status:** 📋 In Progress - Development

---

## Overview

This document tracks implementation of theme switching feature (light/dark/system modes) with focus on:
- Flash-free (FOUC-free) theme application
- System theme detection and response
- User preference persistence
- Accessibility compliance

---

## Design Review Findings

### Issues Found and Fixed

| Issue | Priority | Fix Applied |
|-------|---------|------------|
| No localStorage error handling | High | Added `try-catch` with fallback to 'system' |
| No theme validation | High | Added `validThemes` array for validation |
| Missing CSP considerations | Medium | Added security section with CSP strategy |
| Undefined `updateButtonIcon()` | Medium | Added complete function definition |
| Incomplete CSS transition docs | Low | Clarified limitation (gradients don't transition smoothly) |
| Missing ARIA attributes | Low | Added `role="switch"`, `aria-checked`, `aria-live` |

---

## Task Breakdown

### P0 - Core Functionality

| # | Task | Status | Files |
|---|------|--------|-------|
| P0-1 | Implement FOUC prevention with inline script | ✅ Complete | `DocLayout.astro` |
| P0-2 | Three-state cycling logic (light/dark/system) | ✅ Complete | `DocLayout.astro` |
| P0-3 | localStorage persistence | ✅ Complete | `DocLayout.astro` |
| P0-4 | System theme media query listener | ✅ Complete | `DocLayout.astro` |

### P1 - Experience Enhancements

| # | Task | Status | Files |
|---|------|--------|-------|
| P1-1 | Theme icon rotation animation | ✅ Complete | `global.css`, `DocLayout.astro` |
| P1-2 | Smooth color transitions | ✅ Complete | `global.css` |
| P1-3 | ARIA attributes support | ⏭️ Review | `TopNav.astro` |
| P1-4 | Button icon SVG updates | ✅ Complete | `DocLayout.astro` |

### P2 - Advanced Features

| # | Task | Status | Files |
|---|------|--------|-------|
| P2-1 | prefers-reduced-motion support | ✅ Complete | `global.css` |
| P2-2 | Theme preview tooltip | ⏭️ Pending | - |
| P2-3 | Non-JS fallback | ⏭️ Pending | - |

---

## Pending Work

### P1-3: ARIA Attributes Support

**Current State:** Button has basic `aria-label` only

**Required Changes:**
```astro
<button
  id="theme-toggle-btn"
  type="button"
  role="switch"              // ✅ ADD
  aria-checked="false"         // ✅ ADD (dynamic, 'true' for dark mode)
  aria-live="polite"          // ✅ ADD
  class="..."
>
  <span class="theme-icon">...</span>
</button>
```

**JavaScript Updates:**
```javascript
function applyTheme(themeName) {
  // ... existing code ...

  // Update aria-checked
  var button = document.getElementById('theme-toggle-btn');
  if (button) {
    button.setAttribute('aria-checked', effective === 'dark');
  }

  updateButtonIcon(themeName);
}
```

### P2-2: Theme Preview Tooltip

**Current State:** Button has `title` attribute

**Enhancement:** Add visual indicator of next theme on hover

```css
.theme-toggle-btn:hover::after {
  content: 'Next: ' attr(data-next-theme);
  position: absolute;
  /* ... positioning ... */
}
```

### P2-3: Non-JS Fallback

**Current State:** JavaScript required for theme switching

**Enhancement:** Add `<noscript>` fallback for non-JS browsers

```html
<noscript>
  <style>
    /* Apply system theme as default for non-JS */
    @media (prefers-color-scheme: dark) {
      :root {
        --color-bg-start: #0F172A;
        /* ... dark mode variables ... */
      }
    }
  </style>
</noscript>
```

---

## Test Implementation Plan

### Theme Switching Tests

**File:** `tests/theme-switching.spec.ts` (exists)

**Test Cases:**
- ✅ Cycle through light → dark → system
- ✅ Persist theme in localStorage
- ✅ Apply dark class in dark mode
- ✅ Apply light class in light mode

**Additional Tests Needed:**
- [ ] aria-checked updates correctly
- [ ] System theme change detection works
- [ ] localStorage error handling fallback
- [ ] Theme validation rejects invalid values

---

## Implementation Checklist

### Code Quality
- [x] Error handling for localStorage
- [x] Theme value validation
- [x] No uncaught exceptions
- [ ] All functions properly documented
- [ ] JSDoc comments added

### Accessibility
- [ ] `role="switch"` on button
- [ ] `aria-checked` updates dynamically
- [ ] `aria-live="polite"` added
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

### Security
- [x] Input sanitization
- [x] Error boundary handling
- [x] No direct user input usage
- [ ] CSP headers documented

### Performance
- [x] Inline script in head (minimal blocking)
- [x] No layout shift
- [ ] Performance measurements documented
- [ ] Benchmark completed

---

## File Status

### Modified Files

| File | Changes | Review Status |
|------|--------|--------------|
| `DocLayout.astro` | Theme switching logic + inline script | ⏭️ Pending ARIA updates |
| `TopNav.astro` | Theme button component | ⏭️ Pending ARIA updates |
| `global.css` | Theme icon animation + transitions | ✅ Complete |

### New Files

| File | Purpose | Status |
|------|---------|--------|
| `tests/theme-switching.spec.ts` | Theme switching tests | ✅ Complete |

---

## Next Steps

1. ⏭️ Update `TopNav.astro` with ARIA attributes
2. ⏭️ Update `DocLayout.astro` JS to update `aria-checked`
3. ⏭️ Implement theme preview tooltip (optional)
4. ⏭️ Add non-JS fallback (optional)
5. ⏭️ Add missing test cases
6. ⏭️ Run full Playwright test suite
7. ⏭️ Create final verification report

---

## Sign-off Checklist

Before marking this task complete:

- [ ] All P0 tasks complete and tested
- [ ] All P1 tasks complete and tested
- [ ] P2 tasks evaluated (optional features documented)
- [ ] All tests passing (≥20 tests)
- [ ] No console errors
- [ ] Accessibility audit passed
- [ ] Performance metrics acceptable (≥90 Lighthouse)
- [ ] Code reviewed by another agent
- [ ] Documentation updated
