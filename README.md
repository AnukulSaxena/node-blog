# Node.js Blog API

A simple RESTful API built with Node.js, Express, TypeScript, and MongoDB (Mongoose) for managing blog posts with user authentication.
Live link - https://node-blog-jddq.onrender.com/

## Table of Contents

1.  [Features](#features)
2.  [Technologies Used](#technologies-used)
3.  [Prerequisites](#prerequisites)
4.  [Setup and Installation](#setup-and-installation)
5.  [Environment Variables](#environment-variables)

## Features

*   User Registration and Login using JWT.
*   Secure authentication middleware.
*   CRUD operations for blog posts.
*   Posts are linked to their author.
*   Only authenticated users can create posts.
*   Users can only update or delete their own posts.
*   Input validation using Zod.
*   Global error handling.

## Technologies Used

*   Node.js
*   Express.js
*   TypeScript
*   MongoDB (Mongoose ODM)
*   JSON Web Tokens (JWT)
*   Bcrypt (for password hashing)
*   Zod (for data validation)
*   Cookie-parser
*   CORS
*   Dotenv

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   MongoDB (running locally or a cloud instance like MongoDB Atlas)
*   Git

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/AnukulSaxena/node-blog.git
    cd node-blog # Replace with your repository folder name
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or if using yarn
    # yarn install
    ```

## Environment Variables

Create a `.env` file in the root directory of the project. Add the following variables:

```dotenv
PORT=5001 # Or any port you prefer
MONGODB_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/blog_api_db or your Atlas string
JWT_SECRET=YOUR_VERY_STRONG_AND_SECRET_KEY # REQUIRED: Change this to a long, random, secure string
JWT_EXPIRES_IN=1h # JWT expiration time (e.g., 1h, 7d)
