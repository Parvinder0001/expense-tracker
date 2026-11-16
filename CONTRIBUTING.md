# Contributing

## Individual Contributions

### Student 1 – `<NAME>` (branch `feature-member1`)
- Initialised the repository, `.gitignore`, and invited Student 2 as collaborator
- Implemented **Add expense**, **View expenses**, **Delete expense**
- Built the web page structure and responsive styling
- Files: `expense.py`, `storage.py`, `main.py`, `web/index.html`, `web/style.css`

### Student 2 – `<NAME>` (branch `feature-member2`)
- Cloned the repository and configured Git locally
- Implemented **Search**, **Filter by category**, **Category summary**, **Monthly total**, **CSV export**
- Wrote the web JavaScript (add, delete, search, filter, summary, export)
- Added the **Buy list** feature (branch `student2`): add / view / mark as bought / remove, in both the CLI and the web app
- Files: `reports.py`, `buylist.py`, `web/app.js`

## Branching Strategy
| Branch | Owner | Purpose |
|--------|-------|---------|
| `main` | Both | Stable, merged code |
| `feature-member1` | Student 1 | Core expense features |
| `Student 2` | Student 2 | Reports and search |
| `conflict-m1` / `conflict-m2` | Both | Merge-conflict demonstration |

## Pull Requests
1. Push your feature branch to GitHub.
2. Open a pull request into `main` with a clear description.
3. Your partner reviews it, comments, and approves.
4. Merge only after approval.

| PR | Author | Reviewer |
|----|--------|----------|
| #1 `feature-member1` → `main` | Student 1 | Student 2 |
| #2 `feature-member2` → `main` | Student 2 | Student 1 |

## Code Review Guidelines
- Check that the code runs and handles invalid input
- Keep functions small and named clearly
- Leave constructive comments on the PR

## Commit Message Style
`Add <what>` / `Fix <what>` / `Docs: <what>` — one logical change per commit.
