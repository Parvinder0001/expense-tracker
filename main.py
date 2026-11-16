"""Entry point: menu-driven Personal Expense Tracker."""
from datetime import date

from buylist import buylist_menu
from config import APP_NAME, CURRENCY
from expense import CATEGORIES, PAYMENT_METHODS, validate_amount, validate_date
from reports import print_table, reports_menu
from storage import add_expense, delete_expense, load_expenses


def add_flow(expenses):
    title = input("Title: ").strip()
    if not title:
        print("Title cannot be empty.")
        return
    try:
        amount = validate_amount(input("Amount: "))
        print("Categories:", ", ".join(CATEGORIES))
        category = input("Category: ").strip().title()
        if category not in CATEGORIES:
            category = "Other"
        raw = input(f"Date YYYY-MM-DD [{date.today()}]: ").strip() or str(date.today())
        when = validate_date(raw)
        print("Payment methods:", ", ".join(PAYMENT_METHODS))
        payment_method = input("Payment method [Other]: ").strip().title() or "Other"
        if payment_method not in PAYMENT_METHODS:
            payment_method = "Other"
        tags = [tag.strip() for tag in input("Tags (comma-separated, optional): ").split(",") if tag.strip()]
    except ValueError as err:
        print("Invalid input:", err)
        return
    e = add_expense(expenses, title, amount, category, when, payment_method, tags)
    print(f"Added expense #{e.id}.")


def delete_flow(expenses):
    try:
        expense_id = int(input("Expense ID to delete: "))
    except ValueError:
        print("Please enter a number.")
        return
    print("Deleted." if delete_expense(expenses, expense_id) else "ID not found.")


def main():
    expenses = load_expenses()
    while True:
        print(f"\n=== {APP_NAME} ===")
        print("1. Add expense\n2. View all expenses\n3. Delete expense")
        print("4. Reports & search\n5. Buy list\n0. Exit")
        choice = input("Choose: ").strip()
        if choice == "1":
            add_flow(expenses)
        elif choice == "2":
            print_table(expenses)
            print(f"Total: {CURRENCY} {sum(e.amount for e in expenses):.2f}")
        elif choice == "3":
            delete_flow(expenses)
        elif choice == "4":
            reports_menu(expenses)
        elif choice == "5":
            buylist_menu(expenses)
        elif choice == "0":
            print("Goodbye!")
            break
        else:
            print("Invalid choice.")


if __name__ == "__main__":
    main()
