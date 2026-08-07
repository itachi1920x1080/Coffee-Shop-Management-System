# Coffee Shop System Analysis Diagrams

Based on the structure of your backend (`main.py`), here are the analysis diagrams outlining the system's architecture, data models, and API routing.

## 1. High-Level Architecture Diagram
This diagram shows how the React Frontend communicates with the FastAPI Backend, which then routes requests to specific modules and interacts with the MySQL database.

```mermaid
graph TD
    Client["📱 React Frontend (Vite)"]
    
    subgraph FastAPI Backend
        API_Gateway["⚡ FastAPI Router (main.py)"]
        Auth_Mod["🔐 Auth Module (JWT)"]
        AI_Mod["🤖 AI Generation (Gemini/Pollinations)"]
        
        subgraph Core Business Logic
            CatMenu["☕ Categories & Menus"]
            OrderPay["🛒 Orders & Payments"]
            TableCust["🪑 Tables & Customers"]
            ReportDash["📊 Reports & Dashboard"]
        end
    end
    
    DB[(🗄️ MySQL Database)]
    
    Client -- HTTP/REST --> API_Gateway
    API_Gateway --> Auth_Mod
    API_Gateway --> AI_Mod
    API_Gateway --> CatMenu
    API_Gateway --> OrderPay
    API_Gateway --> TableCust
    API_Gateway --> ReportDash
    
    Auth_Mod --> DB
    CatMenu --> DB
    OrderPay --> DB
    TableCust --> DB
    ReportDash --> DB
```

---

## 2. Entity Relationship Diagram (ERD)
Based on the SQLAlchemy models imported in your `main.py`, here is the logical relationship between the core entities in the database.

```mermaid
erDiagram
    USER ||--o{ ORDER : manages
    USER {
        int id PK
        string username
        string password_hash
        string role
    }
    
    CATEGORY ||--o{ MENU : contains
    CATEGORY {
        int id PK
        string name
        string description
    }
    
    MENU {
        int id PK
        int category_id FK
        string name
        float price
        string image_url
    }
    
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        int id PK
        string name
        string phone
        int total_visits
    }
    
    TABLE ||--o{ ORDER : hosts
    TABLE {
        int id PK
        string status
        int capacity
    }
    
    ORDER ||--o{ PAYMENT : has
    ORDER ||--o{ RECEIPT : generates
    ORDER {
        int id PK
        int customer_id FK
        int table_id FK
        int user_id FK
        float total_amount
        string status
    }
    
    PAYMENT {
        int id PK
        int order_id FK
        float amount_usd
        float amount_khr
        string method
    }
    
    EXPENSE {
        int id PK
        string description
        float amount
        date expense_date
    }
```

---

## 3. API Routing Structure
Here is how the API endpoints are structured and organized via the APIRouter in `main.py`.

```mermaid
mindmap
  root((Coffee Shop API))
    Security
      (/auth) Login & Registration
    Inventory
      (/categories) Manage Categories
      (/menus) Manage Food & Drinks
    Operations
      (/tables) Table Status
      (/customers) Customer CRM
      (/orders) Order Processing
    Finance
      (/payments) Checkout & Currency
      (/expenses) Shop Expenditures
      (/receipts) PDF Generation
    Analytics
      (/dashboard) Daily Summary
      (/reports) Profit & Loss PDF/Excel
    AI Services
      (/ai) Menu & Image Generation
```

> [!TIP]
> You can include these diagrams in your main documentation or use them for team presentations. The diagrams are generated using Mermaid.js syntax, which is natively supported by GitHub Markdown!
