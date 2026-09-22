# Idea to Merge with the Copilot App

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey evermeulen483!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/evermeulen483/skills-idea-to-merge-with-the-copilot-app/issues/1)

## Bookmark manager

Save an HTTP or HTTPS link with or without a scheme (for example, `example.com`).
Links without a scheme default to HTTPS. Each bookmark displays its normalized
original URL followed by ` :: ` and a unique four-character base62 `mona-` alias.
The alias is a local label, not a shortened URL or redirect. Bookmark links open
the original URL in a new tab; **Copy slug** copies only the alias.

Bookmarks stay in this browser's `localStorage` under `mona-bookmarks`; there is
no account, backend, or cross-device sync. Loading validates each record and
skips malformed or duplicate-slug entries with a recovery message. Blocked or
full storage produces accessible feedback and leaves an unsaved URL in the form.
**Clear all** asks for confirmation and removes only this app's storage key.
JavaScript is required; browser APIs run only inside the component's client-side
Astro `<script>`, not during static rendering.

### Local checks (no browser required)

Use Node.js 22.12 or newer, then run:

```sh
npm ci
npm test
npm run build
```

The tests use Node's built-in test runner and TypeScript stripping, with no
browser or extra test dependencies. They cover URL normalization, untrusted
storage recovery, alias collisions, and the exact display separator.
