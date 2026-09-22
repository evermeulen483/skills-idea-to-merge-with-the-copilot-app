# Mona's Bookmark Roadmap

Next steps for Mona's Bookmark Manager App: find links faster, organize favorites, and keep bookmarks safe.

| Area | Item | Type | Priority |
| --- | --- | --- | --- |
| Discovery | Search & filter bookmarks | 🚀 | high |
| Management | Edit a bookmark | 🚀 | high |
| Organization | Tags or folders | 🚀 | medium |
| Portability | Import & export bookmarks | 🚀 | high |
| Reliability | Duplicate slugs on re-add (regression risk) | 🐞 | medium |
| Validation | Empty-URL validation (regression risk) | 🐞 | high |
| Persistence | Bookmark loss when localStorage is cleared | 🐞 | high |

## 🚀 Planned features

- 🔖 Search & filter bookmarks — priority: high
- ✏️ Edit a bookmark — priority: high
- 🗂️ Tags or folders — priority: medium
- 📦 Import & export bookmarks — priority: high

## 🐞 Known bugs & risks

Duplicate-slug and empty-URL protections already exist; preserve them as features evolve. Bookmarks currently live only in this browser's `localStorage`, with no backup or sync.

- 🐞 Duplicate slugs on re-add (regression risk) — priority: medium
- 🛡️ Empty-URL validation (regression risk) — priority: high
- 💾 Bookmark loss when localStorage is cleared — priority: high
