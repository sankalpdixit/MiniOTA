# MiniOTA
Online Travel Agency system with hotel search, cart, and bookings (Node.js + MySQL + TripAdvisor API)


MiniOTA is a simple **Online Travel Agency system** that allows users to search hotels, add them to a cart, and confirm bookings.  
It integrates **frontend (HTML, CSS, JS)** with a **Node.js backend, MySQL database**, and **TripAdvisor API**.

---

## 🚀 Features
- 🔐 **User Authentication** – Secure signup & login using **bcrypt** password hashing
- 🔎 **Hotel Search** – Search hotels via **TripAdvisor Scraper API**
- 🛒 **Cart Management** – Add hotels to cart before booking
- 📅 **Bookings** – Confirm and view bookings, with option to cancel
- 💾 **MySQL Database** – Stores users, carts, and bookings

---

## 🏗️ Project Structure

ota/  
│  
├── frontend/  
│   ├── index.html → Homepage + Hotel Search  
│   ├── signup.html → Signup page  
│   ├── login.html → Login page  
│   ├── cart.html → Cart page  
│   ├── booking.html → My Bookings page  
│   ├── script.js → Client-side logic  
│   └── styles.css → Custom styles  
│  
└── backend/  
    └── server.js → Express.js server + API routes  


---

## 🗄️ Database Design
- **users**
  - `id`, `name`, `email`, `password`
- **cart**
  - `id`, `userid`, `username`, `hotelname`, `price`, `link`, `checkin`, `checkout`
- **booking**
  - `id`, `userid`, `username`, `hotelname`, `price`, `link`, `checkin`, `checkout`, `guests`
 
---

## 📸 Screenshots (Add Later)

- 🏠 **Home Page**
- <img width="1322" height="742" alt="image" src="https://github.com/user-attachments/assets/003c2371-6384-4d22-87e8-8b1ae69d84d6" />

- 🔑 **Signup & Login**
-  <img width="1322" height="742" alt="image" src="https://github.com/user-attachments/assets/0fcd1bbb-8471-4588-a694-cdcc580229db" />

- 🔍 **Hotel Search**
- <img width="1312" height="742" alt="image" src="https://github.com/user-attachments/assets/5805996a-347f-4490-bd9b-6282fb21dde8" />

- 🛒 **Cart**
- <img width="1322" height="742" alt="image" src="https://github.com/user-attachments/assets/e6095ef3-9aea-4767-bfc1-e1f0ea924965" />


- 📅 **My Bookings**
- <img width="1322" height="742" alt="image" src="https://github.com/user-attachments/assets/59e4aa86-faee-4376-9099-10943267160e" />

---


## 👨‍💻 Author

**Sankalp Dixit**  
📧 Contact: dixitsankalp73@gmail.com 
