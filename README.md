# Petopia
**Authors:** 	Yishay Harel, Amanda Holding, Blinda Hu, Jessica Livchits, Sophia Zhang

**About:** Petopia is a full-stack e-commerce platform designed for pet lovers. Users can browse a premium collection of pet supplies and securely purchase items.

## Features
* **Product Catalog:** Dynamic product grid fetched from a Supabase PostgreSQL database.
* **Secure Checkout:** Integrated with **Stripe API** for safe credit card processing.
* **User Accounts:** View order history and account details.

## Tech Stack
**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling)
* React Router (Navigation)
* Stripe Elements (Payments)

**Backend:**
* Node.js & Express
* PostgreSQL (hosted on Supabase)
* Stripe SDK
## Installation/Execution Instructions:
**Prerequisites:**
Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/) (or a Supabase account)

### Instructions
**Clone this repository to your system:** 
* Click the "Code" button in this repository
* Copy the SSH link
* Go to your terminal
  * Clone the repository and enter the directory: ```bash
    git clone git@github.com:CISC-3140-Project/E-Commerce.git
    cd E-Commerce
    ```
**Database Setup:**
* To get the database running:
  * Open your SQL editor (Supabase SQL Editor or psql)
  * Copy the contents of schema.sql and run the script to create the necessary tables.
* **Populate the Shop (Optional but Recommended):**
To see products in the store, run this SQL command after creating your tables:
* ```sql
INSERT INTO products (name, price, description, category)
VALUES 
('Classic Dog Leash', 15.99, 'Durable 6ft leash', 'Accessories'),
('Catnip Mouse Toy', 5.50, 'Hours of fun for your cat', 'Toys'),
('Premium Bird Seed', 12.00, 'Nutritious mix for wild birds', 'Food');``` 

**Installing Dependencies:**
To install it locally:
1) **Frontend:**
   * run: ```bash
    cd frontend
    npm install
    ```
2) **Backend:**
   * run: ```bash
    cd ../backend
    npm install
    ```
### **Environment Variables Setup**
The app requires specific keys to connect to the database and payment processor. Create a `.env` file in the `/backend` directories.
**Backend (`/backend/.env`):**
* ```env PORT=5001
DATABASE_URL=your_supabase_postgresql_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key ```

**Note on Stripe Integration**
The Stripe Public Key is currently hardcoded in frontend/src/components/Carts.jsx.
* **To use your own Stripe account:**
  * Replace the string starting with pk_test_... with your own Publishable key from the [Stripe Dashboard](https://dashboard.stripe.com/login?redirect=%2Ftest%2Fapikeys).

### Running the Project
Once the dependencies are installed, follow these steps to start the development servers. Note: You will need two terminal windows open.
* **Start the Backend:**
   If you are already in the backend directory:
   * run: ```bash
     npm run dev
     ```
  If you are starting from the root of the project:
  * run: ```bash
    cd backend
    npm run dev
    ```
***You should see:** Server is running on http://localhost:5001 (or your configured port)* 
**In the second terminal:**
* **Start the Frontend:**
   If you are already in the frontend directory:
   * run: ```bash
     npm run dev
     ```
  If you are starting from the root of the project:
  * run: ```bash
    cd frontend
    npm run dev
  ```
***You should see:** Local: http://localhost:3000/ (or your configured port) Copy this link in your browser*

## Testing the Checkout
* Add item(s) to the cart
* Click checkout when ready
  * To test the purchase flow:
    1) Use any email address at checkout.
    2) For the credit card, use the **Stripe Test Card Number**: `4242 4242 4242 4242`.
    3) Use any future date for expiry and any 3 digits for CVC.
