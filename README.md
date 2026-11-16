# 💰 Personal Expense Tracker

A menu-driven command-line application to record, search and summarise personal expenses.
Built as the **SEC101 MCA Group Assignment** (Git, GitHub and Markdown).

## 🎯 Objectives
- Build a working Python project collaboratively using **Git and GitHub**
- Practise **branching, pull requests, code review and merge-conflict resolution**
- Document the project using **Markdown**

## 👥 Team Members

| Member | Roll No. | GitHub | Contribution |
|--------|----------|--------|--------------|
| Student 1 – `parvinder` | `42` | [@Parvinder0001](https://github.com/username1) | `expense.py`, `storage.py`, `main.py` (add / view / delete), `web/index.html`, `web/style.css` |
| Student 2 – `sahil sharma` | `51` | [@Sahil-Sharma-2107](https://github.com/username2) | `reports.py` (search / filter / summary / monthly total / CSV export), `web/app.js` |

## ✨ Features
1. **Add** an expense with title, amount, category and date (with validation)
2. **View** all expenses in a table with running total
3. **Delete** an expense by ID
4. **Search** expenses by keyword
5. **Filter** by category
6. **Category-wise summary** of spending
7. **Monthly total** for any `YYYY-MM`
8. **Export** all expenses to CSV
9. **Buy list** – note down things to buy in the future with an estimated cost and priority, see the planned total, and mark an item as *bought* to turn it into an expense
10. **Responsive web version** – works on mobile, tablet and desktop, with dark mode

## 🛠 Technologies
- Python 3.9+ (standard library only)
- HTML5, CSS3 (mobile-first, media queries, Grid/Flexbox) and vanilla JavaScript
- Git & GitHub
- JSON for storage, CSV for export

## 📁 Project Structure
```text
expense-tracker/
├── main.py          # Menu and program entry point
├── expense.py       # Expense model + validation
├── storage.py       # JSON load/save, add, delete
├── reports.py       # Search, filter, summaries, CSV export
├── buylist.py       # Buy list for future purchases
├── config.py        # Shared settings
├── web/
│   ├── index.html   # Responsive page structure
│   ├── style.css    # Mobile-first styles + dark mode
│   └── app.js       # Web version of all features (localStorage)
├── data/            # Runtime data (ignored by git)
├── README.md
├── CONTRIBUTING.md
└── .gitignore
```

## ⚙️ Installation & Execution
```bash
git clone https://github.com/username1/expense-tracker.git
cd expense-tracker
python main.py
```
No external packages are required.

### Run the responsive web version
Open `web/index.html` in any browser (no server needed), or use GitHub Pages:
**Settings → Pages → Deploy from branch → `main` / `/web`**.
Resize the browser window (or use DevTools device mode) to see the responsive layout.

## 🖥 Sample Output
```text
=== Personal Expense Tracker ===
1. Add expense
2. View all expenses
3. Delete expense
4. Reports & search
5. Buy list
0. Exit

ID  Date        Category       Amount  Title
----------------------------------------------------
1   2026-11-10  Food           150.00  Lunch
2   2026-11-11  Travel          40.00  Bus ticket
Total: Rs. 190.00
```

### Buy list sample
```text
--- Buy List ---
ID  Priority  Category    Est. cost  Item
----------------------------------------------------
1   High      Shopping      1800.00  Laptop bag
3   Medium    Education      600.00  Books
2   Low       Other         2500.00  Headphones
Estimated total: Rs. 3100.00
```

## 📚 More
See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow we followed.

> **Note:** *Replace the placeholders above with your real names, roll numbers and GitHub usernames.*
