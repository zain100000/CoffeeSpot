# ☕ Coffee Spot

## Overview

**Coffee Spot** is a full-stack mobile and web application built to help users discover nearby coffee shops, place orders, earn rewards, and more. It includes:

- **📱 User App** – A React Native CLI mobile application for Android users  
- **🔧 Backend** – A Node.js + Express REST API for handling all business logic and data  
- **🛠 Super Admin Panel** – A React.js web dashboard for managing shops, users, orders  

All codebases are modular, scalable, and follow best practices in architecture and design.

---

## 🧱 Project Structure
coffee-spot/
- backend/ # Node.js + Express API
- super-admin-panel/ # React.js Web App
- user-app/ # React Native CLI App

---

## 📱 User App – React Native CLI

### Features
- User authentication & profile management
- Cart, ordering, and payment flow(local payment flow)
- order history

### Folder Structure
user-app/
 src/
- assets/ # Images, fonts, icons
- navigation/ # React Navigation stack setup
- redux/ # redux setup for backend api management
- screens/ # Auth, Home, Profile, Orders, etc.
- styles/ # Global styles and themes
- utils/ # Utility/helper functions
- App.js
- package.json

