"""Expense model and input validation (Student 1)."""
from dataclasses import dataclass, asdict, field
from datetime import datetime

CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Health", "Education", "Other"]
PAYMENT_METHODS = ["Cash", "UPI", "Debit Card", "Credit Card", "Bank Transfer", "Other"]


@dataclass
class Expense:
    id: int
    title: str
    amount: float
    category: str
    date: str  # YYYY-MM-DD
    payment_method: str = "Other"
    tags: list = field(default_factory=list)

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def from_dict(data):
        return Expense(int(data["id"]), data["title"], float(data["amount"]),
                       data["category"], data["date"], data.get("payment_method", "Other"),
                       data.get("tags", []))


def validate_amount(text):
    """Return a positive float or raise ValueError."""
    value = float(text)
    if value <= 0:
        raise ValueError("Amount must be greater than zero.")
    return round(value, 2)


def validate_date(text):
    """Return date string in YYYY-MM-DD or raise ValueError."""
    return datetime.strptime(text, "%Y-%m-%d").strftime("%Y-%m-%d")
