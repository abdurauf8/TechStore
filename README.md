# TechStore

This is my first simple full-stack online store for browsing and managing technology products. Users can search and filter products, add items to their shopping cart select favorites, and switch light and dark themes. The admin page allows users to add, edit, and delete products.

## Technologies Used
HTML5, CSS3, JavaScript, Node.js, Vite, Eslint, REST API, GIT

### Prerequisites
- Node.js and npm installed

### 1. Clone the repository

git clone https://github.com/abdurauf8/TechStore.git
`cd TechStore`

### 2. Install dependencies
`npm install`

### 3. Start the backend server
Open a terminal and run:
`node server/server.js`

The backend API runs at:
`http://localhost:3300`

### 4. Start the frontend
Open a second terminal and run:
`npm run dev`

Vite will display the local frontend URL in the terminal, usually:
`http://localhost:5173`

Open the displayed URL in your browser.

## API Endpoints
Base URL: `http://localhost:3300`

| Method | Endpoint | Description |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get a product by ID |
| POST | `/products` | Add a new product |
| PUT | `/products/:id` | Update an existing product |
| DELETE | `/products/:id` | Delete a product |

**Note:** Product data is stored in a JavaScript array in memory. Changes are not permanently saved and reset when the backend server restarts.

## Features

- Browse technology products
- Search products by name
- Filter products by category
- Navigate products using pagination
- Add and remove favorite products
- Add products to the shopping cart
- Control products in cart and calculate prices
- Save cart and favorite data using localStorage
- Switch between light and dark themes
- Add, edit, and delete products through the admin page

## Screenshot

![TechStore Homepage(light)](./screenshot(2).png)
![TechStore Homepage(dark)](./screenshot.png)

## Author: Abdurauf.
GitHub: [abdurauf8](https://github.com/abdurauf8)
