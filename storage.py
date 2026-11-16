"""JSON file storage and add/delete operations (Student 1)."""
import json
import os

from config import DATA_FILE
from expense import Expense


def load_expenses():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return [Expense.from_dict(d) for d in json.load(f)]
    except (json.JSONDecodeError, KeyError, ValueError):
        print("Warning: data file is corrupted. Starting with an empty list.")
        return []


def save_expenses(expenses):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump([e.to_dict() for e in expenses], f, indent=2)


def next_id(expenses):
    return max((e.id for e in expenses), default=0) + 1


def add_expense(expenses, title, amount, category, date, payment_method="Other", tags=None):
    expense = Expense(next_id(expenses), title, amount, category, date, payment_method, tags or [])
    expenses.append(expense)
    save_expenses(expenses)
    return expense


def delete_expense(expenses, expense_id):
    """Delete by id. Returns True if something was deleted."""
    for e in expenses:
        if e.id == expense_id:
            expenses.remove(e)
            save_expenses(expenses)
            return True
    return False
