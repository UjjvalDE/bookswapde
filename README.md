# BookSwap - Book Exchange Platform

A platform for exchanging and reselling books built with Node.js, Express, and MongoDB.

## Features

- User authentication and profiles
- Book listing and management
- Book exchange functionality
- Email notifications
- File uploads for book images

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/UjjvalDE/Book.git
cd Book
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/bookswap
JWT_SECRET=your_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Start MongoDB:
```bash
mongod
```

5. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── controllers/     # Route controllers
├── models/         # Database models
├── routes/         # Application routes
├── views/          # EJS templates
├── public/         # Static files
├── uploads/        # File uploads
├── setting/        # Application settings
└── index.js        # Application entry point
```

## API Endpoints

- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/books - Get all books
- POST /api/books - Create a new book listing
- PUT /api/books/:id - Update a book listing
- DELETE /api/books/:id - Delete a book listing

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 