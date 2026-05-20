# ProShop - E-commerce Management System

A professional Multi-role E-commerce Management System built with **Node.js**, **Express.js**, **MongoDB**, and **EJS**. This application is designed with a scalable modular architecture and provides specialized workflows for Administrators, Employees, and Customers.

## 🚀 Features

### 🔐 Secure Authentication & Access Control
- **JWT-Based Authentication**: Secure login using JSON Web Tokens stored in HTTP-only cookies.
- **Role-Based Access Control (RBAC)**: Strict permission layers for Admin, Employee, and Customer roles.
- **Account Safety**: Features for account deactivation, reactivation, and soft-deletion.

### 🛠️ Admin Capabilities
- **User Management**: Full visibility into the user base with the ability to deactivate or reactivate accounts.
- **Staffing**: Create and manage Employee accounts.
- **Audit System**: Detailed tracking of system activities with specialized logs for security and monitoring.
- **Business Overview**: Centralized dashboard to monitor users, bookings, and audit trails.

### 📦 Employee Workflow
- **Inventory Management**: Full CRUD (Create, Read, Update, Delete) operations for products and categories within assigned domains.
- **SEO Optimization**: Integrated support for meta titles, descriptions, slugs, and keywords.
- **Shipping & Logistics**: 
  - Manage shipping logs and update tracking statuses.
  - Automated "Nearest Hub" detection when the package reaches the delivery city.
  - Real-time tracking history updates.
- **Order Fulfillment**: Track and manage assigned bookings.

### 🛍️ Customer Experience
- **Dynamic Shop**: Advanced product browsing with filters for Category, Price Range, and Stock Availability.
- **Personalized Dashboard**: Track orders, manage profile details, and monitor notifications.
- **Address Book**: Manage multiple delivery addresses (limit of 5 for security/simplicity).
- **Wishlist**: Save favorite products for later purchase.
- **Notification Center**: Real-time alerts for profile updates, shipping milestones, and account activities.

### ⚙️ Technical Highlights
- **Modular Routing**: Clean separation of concerns for easy maintenance and scalability.
- **Robust Error Handling**: Centralized error middleware with custom 404 and 500 error pages.
- **Database Integrity**: Mongoose schemas with validation and deep population for complex data relationships.
- **Audit Logging**: Every critical action (product update, address change, account status change) is logged for security compliance.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (via Mongoose) |
| **Templating** | EJS (Embedded JavaScript) |
| **Auth** | JWT (JSON Web Tokens) & Bcrypt |
| **Env Management**| Dotenv |

## 🏁 Getting Started

### 📋 Prerequisites
- Node.js (v14+ recommended)
- MongoDB instance (Local or Atlas)

### ⚙️ Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

### 🚀 Running the App
```bash
npm start
```