#  Travique

> Explore, Add, Filter, and Review Destinations – Your Travel Companion  

Travique is a **full-stack travel platform** where users can discover amazing destinations, add their own listings, filter and search easily, and leave reviews. Built with **Node.js, Express, MongoDB, and Bootstrap**.

## 🚀 Features

### User Features
- **Authentication**: Users can sign up, log in, and log out.  
- **Listing Exploration**: View all available travel destinations with detailed information, including images, place name, price, and location.  
- **Search & Filter**: Quickly search for destinations and filter listings by categories.  
- **Google Maps Integration**: See the location of each destination on an interactive map.  
- **Reviews**: Users can add reviews to listings and edit/delete their own reviews.  
- **Listing Management**: Users who create listings can edit or delete them at any time.  

### UI/UX Features
- **Responsive Design**: Built with Bootstrap to ensure responsiveness across devices.  
- **Interactive Cards**: Listing cards have hover effects, zoom-in animations on images, and subtle shadows for a polished look.  
- **Rounded Corners**: Custom styling for top corners of cards and elements for a modern appearance.  
- **Professional Color Scheme**: Light background for the body, black navbar, and elegant footer for a clean look.  
- **Smooth Hover Effects**: Images and buttons have smooth transitions for better user interaction.  

### Backend & Database
- **Express.js Server**: Handles routing, sessions, and user authentication.  
- **MongoDB & Mongoose**: Listings, users, and reviews are stored in MongoDB Atlas.  
- **Data Seeding**: Sample data can be seeded into the database for easy testing.  

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Bootstrap 5  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas (Mongoose)  
- **Authentication:** Express-session, Passport.js (if used)  
- **Deployment:** (optional: Render, Heroku, Vercel)

---

## 📂 Project Structure
```
Travique/
│
├── Controllers/ # Handles request logic (listing, user, review controllers)
│
├── init/ # Database initialization and seed data (sample listings)
│
├── models/ # Mongoose schemas and models (Listing, User, Review)
│
├── node_modules/ # Project dependencies (auto-generated)
│
├── public/ # Static assets (CSS, JS, Images)
│
├── routes/ # Express route definitions (listing, user, review routes)
│
├── utils/ # Utility/helper functions
│
├── views/ # EJS templates (frontend pages)
│
├── .env # Environment variables (MongoDB URI, API keys, secrets)
├── .gitignore # Files/folders ignored by Git
├── app.js # Main entry point of the application
├── cloudConfig.js # Cloudinary configuration for image uploads
├── middleware.js # Custom middleware (auth checks, error handling)
├── package-lock.json # Auto-generated dependency lock file
├── package.json # Project metadata and dependencies
├── README.md # Project documentation
└── schema.js # Extra schema definitions (if any)
```


##  🔗 Live Demo

You can check out the live deployed version here:  
[![Live Demo](https://img.shields.io/badge/Live-Website-green?style=for-the-badge&logo=vercel)](https://travique-fxzw.onrender.com)



