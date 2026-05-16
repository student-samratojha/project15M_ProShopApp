# ProShop - E-commerce Management System

A robust Multi-role E-commerce Management System built with **Node.js**, **Express.js**, **MongoDB**, and **EJS**. This application features distinct dashboards for Admins, Employees, and Customers.

## Features

- **Role-Based Access Control**: Separate views and permissions for Admin, Employee, and Customer.
- **Admin Dashboard**: Overview of users, activity audits, and booking assignments.
- **Employee Dashboard**: Manage assigned bookings, products, and categories.
- **Customer Dashboard**: Profile management and order tracking.
- **Product Management**: Full CRUD operations for products and categories with SEO support.
- **Modular Routing**: Organized code structure for scalability.
- **Error Handling**: Global error handling and custom 404 pages.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Template Engine**: EJS
- **Environment Management**: dotenv

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance running

### Installation

1. Clone the repository.
2. Install dependencies:
   ```javascript
   npm install
   ```
3. Create a `.env` file in the root directory:
   `PORT=3000`, `MONGODB_URI=your_mongodb_connection_string`

### Running the App
```bash
npm start
```