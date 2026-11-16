"""Buy list: things to purchase in the future (Student 2)."""
import json
import os
from dataclasses import dataclass, asdict
from datetime import date

from config import BUYLIST_FILE, CURRENCY
from expense import CATEGORIES, PAYMENT_METHODS, validate_amount
from storage import add_expense

PRIORITIES = ["High", "Medium", "Low"]


@dataclass
class BuyItem:
    id: int
    name: str
    price: float      # estimated cost
    priority: str     # High / Medium / Low
    category: str     # used when the item is bought and becomes an expense

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(data):
        return BuyItem(int(data["id"]), data["name"], float(data["price"]),
                       data["priority"], data["category"])


def load_buylist():
    if not os.path.exists(BUYLIST_FILE):
        return []
    try:
        with open(BUYLIST_FILE, "r", encoding="utf-8") as f:
            return [BuyItem.from_dict(d) for d in json.load(f)]
    except (json.JSONDecodeError, KeyError, ValueError):
        print("Warning: buy list file is corrupted. Starting with an empty list.")
        return []


def save_buylist(items):
    os.makedirs(os.path.dirname(BUYLIST_FILE), exist_ok=True)
    with open(BUYLIST_FILE, "w", encoding="utf-8") as f:
        json.dump([i.to_dict() for i in items], f, indent=2)


def add_item(items, name, price, priority, category):
    new_id = max((i.id for i in items), default=0) + 1
    item = BuyItem(new_id, name, price, priority, category)
    items.append(item)
    save_buylist(items)
    return item


def remove_item(items, item_id):
    """Remove by id. Returns True if something was removed."""
    for i in items:
        if i.id == item_id:
            items.remove(i)
            save_buylist(items)
            return True
    return False


def mark_bought(items, item_id, expenses, actual_price=None):
    """Turn a buy-list item into a real expense. Returns the Expense or None."""
    for i in items:
        if i.id == item_id:
            price = actual_price if actual_price is not None else i.price
            print("Payment methods:", ", ".join(PAYMENT_METHODS))
            payment_method = input("Payment method [Other]: ").strip().title() or "Other"
            if payment_method not in PAYMENT_METHODS:
                payment_method = "Other"
            expense = add_expense(expenses, i.name, price, i.category, str(date.today()), payment_method)
            remove_item(items, item_id)
            return expense
    return None


def sorted_items(items):
    """High priority first, then cheapest first."""
    return sorted(items, key=lambda i: (PRIORITIES.index(i.priority), i.price))


def total_estimate(items):
    return round(sum(i.price for i in items), 2)


def print_buylist(items):
    if not items:
        print("Your buy list is empty.")
        return
    print(f"{'ID':<4}{'Priority':<10}{'Category':<11}{'Est. cost':>10}  Item")
    print("-" * 52)
    for i in sorted_items(items):
        print(f"{i.id:<4}{i.priority:<10}{i.category:<11}{i.price:>10.2f}  {i.name}")
    print(f"Estimated total: {CURRENCY} {total_estimate(items):.2f}")


def _add_flow(items):
    name = input("Item name: ").strip()
    if not name:
        print("Item name cannot be empty.")
        return
    try:
        price = validate_amount(input("Estimated cost: "))
    except ValueError as err:
        print("Invalid input:", err)
        return
    priority = input(f"Priority ({'/'.join(PRIORITIES)}) [Medium]: ").strip().title() or "Medium"
    if priority not in PRIORITIES:
        print("Unknown priority, using Medium.")
        priority = "Medium"
    print("Categories:", ", ".join(CATEGORIES))
    category = input("Category: ").strip().title()
    if category not in CATEGORIES:
        category = "Other"
    item = add_item(items, name, price, priority, category)
    print(f"Added '{item.name}' to your buy list (#{item.id}).")


def _id_prompt(text):
    try:
        return int(input(text))
    except ValueError:
        print("Please enter a number.")
        return None


def _bought_flow(items, expenses):
    item_id = _id_prompt("ID of the item you bought: ")
    if item_id is None:
        return
    raw = input("Actual price paid (press Enter to use the estimate): ").strip()
    try:
        actual = validate_amount(raw) if raw else None
    except ValueError as err:
        print("Invalid input:", err)
        return
    expense = mark_bought(items, item_id, expenses, actual)
    if expense:
        print(f"Bought! Recorded as expense #{expense.id}.")
    else:
        print("ID not found.")


def buylist_menu(expenses):
    items = load_buylist()
    while True:
        print("\n--- Buy List ---")
        print("1. View buy list\n2. Add item\n3. Mark item as bought")
        print("4. Remove item\n0. Back")
        choice = input("Choose: ").strip()
        if choice == "1":
            print_buylist(items)
        elif choice == "2":
            _add_flow(items)
        elif choice == "3":
            _bought_flow(items, expenses)
        elif choice == "4":
            item_id = _id_prompt("Item ID to remove: ")
            if item_id is not None:
                print("Removed." if remove_item(items, item_id) else "ID not found.")
        elif choice == "0":
            break
        else:
            print("Invalid choice.")
