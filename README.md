🎓 GEU Nexus
Your Campus, Connected.
GEU Nexus is a student-built prototype web platform for the Graphic Era University campus community — a single place for lost & found, buying/selling/donating, discovering nearby cafes, and finding student housing, instead of relying on scattered WhatsApp groups and word-of-mouth.
⚠️ Status: Basic Prototype — this is an early, internal proof-of-concept. Functionality and data are limited and not production-ready.
🔗 Live demo: divyeshpant1103-bit.github.io/Design-Thinking/login.html 💻 Repo: github.com/divyeshpant1103-bit/Design-Thinking
Demo Login
Field	Value
University Email	admin@geu.ac.in
Password	nexus
Features
🔍 Lost & Found — report or browse lost items, filterable by status, category, and location
🛒 Marketplace (Buy/Sell/Donate) — textbooks, drafters, and hostel gear from seniors, filterable by category and condition, with a live feed
☕ Nearby Cafes — discover cafes and food joints around campus, filterable by distance, cuisine, and rating
🏠 PG Listings — student housing filterable by gender, price range, and amenities
📢 Notice Board — campus-wide announcements (exam schedules, hackathons, library timings, shuttle routes, placement drives)
🔐 Secure Login — GEU-email-gated authentication screen
🌙 Dark Mode — theme toggle, preference saved locally
Tech Stack
Frontend: HTML5, CSS3, JavaScript (ES6)
Local Persistence: Browser LocalStorage (auth session, theme, lost & found items)
Data Source: Published Google Sheets (fetched as CSV) powering the Marketplace and PG listings
Problem Addressed
Fragmentation of campus information — lost items, buying/selling gear, and finding local food/housing options are all currently scattered across group chats and word-of-mouth. GEU Nexus consolidates them into one platform.
Project Structure
├── index.html          # Home page
├── login.html           # Login page
├── lost-found.html       # Lost & Found
├── marketplace.html      # Buy/Sell/Donate
├── cafes.html            # Nearby Cafes
├── pgs.html              # PG Listings
├── app.js                # Shared JS (auth, theme, data fetching)
├── style.css              # Shared styles
└── logo.png               # Site logo
Team
Divyesh Pant — Lead Developer
Ashvath Shaily
Ananya Sharma
Sarthak Jaiswal
Vinayak Lakhera

Feedback
Feedback is welcome — feel free to open an issue or reach out.
📸 Instagram
Built with ❤️ by GEU students, Graphic Era University, Dehradun.
