# 📌 Expense Tracker - Setup & Implementation Guide

Thank you for reviewing the **Expense Tracker (Vintage-Modern Edition)**. This document provides step-by-step instructions to get the full-stack application running on your local machine.

---

## 🛠️ Prerequisites
Before you begin, ensure you have the following installed:
1.  **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2.  **Python** (v3.9 or higher) - [Download here](https://www.python.org/)

---

## 🚀 Step-by-Step Installation

### 1. Extract the Project
Unzip the `ExpenseTracker_FullProject.zip` file into a folder of your choice.

### 2. Set Up the Backend (FastAPI)
1.  Open a terminal and navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    - **Windows**: `.\venv\Scripts\activate`
    - **Mac/Linux**: `source venv/bin/activate`
4.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the backend server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *The backend API will now be running at `http://localhost:8000`.*

### 3. Set Up the Frontend (React + Vite)
1.  Open a **second terminal** and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install the Node.js dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *The application will launch at `http://localhost:5173`.*

---

## 💻 Testing the Application

1.  Open your browser to `http://localhost:5173`.
2.  **Registration**: Click **"Create one now"** to register. Note the new **Email** and **Confirm Password** fields.
3.  **Dashboard**: Once logged in, you will see the **Vintage Monochrome** theme.
4.  **Transactions**: Add a few transactions (Income/Expenses) to see the charts update in real-time.
5.  **Budgets**: Set a category budget to see the high-contrast progress bars and alerts.

---

## 🎨 Key Features to Note
- **Custom Theme**: A curated black/grey monochrome aesthetic with premium typography (`Cinzel` & `Inter`).
- **Security**: JWT-based authentication with backend password hashing.
- **Analytics**: Real-time spending breakdown and net income tracking.
- **Smart Alerts**: Dynamic warnings for debt and overspending.

---
*Developed for excellence. Happy reviewing!*
