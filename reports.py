"""Search, filter, summaries and CSV export (Student 2)."""
import csv
from collections import defaultdict

from config import CURRENCY, EXPORT_FILE
from expense import CATEGORIES


def search_expenses(expenses, keyword):
    keyword = keyword.lower()
    return [e for e in expenses if keyword in e.title.lower()
            or keyword in e.payment_method.lower()
            or any(keyword in tag.lower() for tag in e.tags)]


def filter_by_category(expenses, category):
    return [e for e in expenses if e.category.lower() == category.lower()]


def category_summary(expenses):
    totals = defaultdict(float)
    for e in expenses:
        totals[e.category] += e.amount
    return dict(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))


def monthly_total(expenses, month):
    """month format: YYYY-MM"""
    return round(sum(e.amount for e in expenses if e.date.startswith(month)), 2)


def export_csv(expenses, path=EXPORT_FILE):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Title", "Amount", "Category", "Date", "Payment Method", "Tags"])
        for e in expenses:
            writer.writerow([e.id, e.title, e.amount, e.category, e.date, e.payment_method, "; ".join(e.tags)])
    return path


def print_table(items):
    if not items:
        print("No expenses found.")
        return
    print(f"{'ID':<4}{'Date':<12}{'Category':<11}{'Amount':>10}  {'Payment':<14}Title / tags")
    print("-" * 76)
    for e in items:
        tags = f"  #{' #'.join(e.tags)}" if e.tags else ""
        print(f"{e.id:<4}{e.date:<12}{e.category:<11}{e.amount:>10.2f}  {e.payment_method:<14}{e.title}{tags}")


def reports_menu(expenses):
    print("\n--- Reports & Search ---")
    print("1. Search by keyword")
    print("2. Filter by category")
    print("3. Category-wise summary")
    print("4. Monthly total")
    print("5. Export to CSV")
    choice = input("Choose: ").strip()
    if choice == "1":
        print_table(search_expenses(expenses, input("Keyword: ")))
    elif choice == "2":
        print("Categories:", ", ".join(CATEGORIES))
        print_table(filter_by_category(expenses, input("Category: ").strip()))
    elif choice == "3":
        summary = category_summary(expenses)
        if not summary:
            print("No expenses yet.")
        for cat, total in summary.items():
            print(f"{cat:<12}{CURRENCY} {total:>10.2f}")
    elif choice == "4":
        month = input("Month (YYYY-MM): ").strip()
        print(f"Total for {month}: {CURRENCY} {monthly_total(expenses, month):.2f}")
    elif choice == "5":
        print("Exported to", export_csv(expenses))
    else:
        print("Invalid choice.")
