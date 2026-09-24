from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import date

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)

    transactions = relationship("Transaction", back_populates="owner")
    budgets = relationship("Budget", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # "income" or "expense"
    category = Column(String, nullable=False)
    description = Column(String)
    date = Column(Date, default=date.today)
    is_recurring = Column(Boolean, default=False)
    receipt_image_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="transactions")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String, nullable=False)
    limit_amount = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    owner = relationship("User", back_populates="budgets")
