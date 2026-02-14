# Metro Police System - Setup Guide

## 🚀 Project Overview

Full-stack Metro Police system , built for Bangladesh Police (Metro Police).

**Tech Stack:**
- Frontend: HTML, CSS, React
- Backend: Node.js, Express
- Database: MySQL
- Server: XAMPP / localhost

## 📋 Prerequisites

1. **XAMPP** installed and running
2. **Node.js** (v14 or higher)
3. **MySQL** (via XAMPP)
4. **npm** or **yarn**

## 🗄️ Database Setup

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database or use existing `metropolice`
4. Import the database schema:
   - Run `database/schema.sql` in phpMyAdmin
   - This creates all necessary tables
5. (Optional) Import dummy data:
   - Run `database/dummy_data.sql` for sample data

### Database Configuration

Update `backend/db.js` with your MySQL credentials:
```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Your MySQL username
  password: '',        // Your MySQL password
  database: 'metropolice'
});
```

## 🔧 Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, for JWT secret):
```env
JWT_SECRET=metro_police_secret_key_2024
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

## 🎨 Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or similar Vite port)

## 📁 Project Structure

```
Metro-Police/
├── backend/
│   ├── routes/          # API route files
│   ├── middleware/      # Auth middleware
│   ├── db.js           # Database connection
│   └── server.js       # Express server
├── database/
│   ├── schema.sql      # Database schema
│   └── dummy_data.sql  # Sample data
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── context/        # React context (Auth)
│   ├── utils/          # Utilities (API)
│   └── styles/         # CSS files
└── package.json
```

## 🔑 Default Admin Account

After importing dummy data:
- **Email:** admin@metropolice.gov.bd
- **Password:** (check dummy_data.sql - password is hashed with bcrypt)
- **Note:** You may need to create admin account manually or use a test password

## 🌐 API Endpoints

All API endpoints are prefixed with `/api`:

- **Authentication:** `/api/auth/login`, `/api/auth/register`
- **Traffic Fines:** `/api/traffic-fines/*`
- **Crime Reports:** `/api/crime-reports/*`
- **Lost Items:** `/api/lost-items/*`
- **Missing Persons:** `/api/missing-persons/*`
- **Missing Vehicles:** `/api/missing-vehicles/*`
- **PCC:** `/api/pcc/*`
- **Maps:** `/api/maps/*`
- **SOS:** `/api/sos/*`
- **Crime Prediction:** `/api/crime-prediction/*`
- **Chatbot:** `/api/chatbot/*`
- **Criminals:** `/api/criminals/*`

## ✨ Features Implemented

✅ Traffic Fine Check & Online Payment (mock)
✅ Crime/Incident Reporting (Online GD)
✅ Case Status Tracking
✅ Lost Item Report + Certificate PDF
✅ Missing Person & Vehicle Auto-Match
✅ Police Clearance Certificate (PCC)
✅ Crime Risk Map (heatmap)
✅ Police Patrolling Heatmap
✅ Safe Route GPS
✅ SOS Emergency Button
✅ Crime Pattern Prediction
✅ Cyberbullying Chat Assistant
✅ Criminal Database Search
✅ Face Recognition Alert (simulated)
✅ Admin Dashboard
✅ Citizen Dashboard

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running in XAMPP
- Check credentials in `backend/db.js`
- Verify database `metropolice` exists

### Port Already in Use
- Change PORT in `.env` or `server.js`
- Kill process using the port

### CORS Errors
- Backend CORS is configured for `localhost`
- Ensure backend is running before frontend

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend
- Verify token is being sent in requests

## 📝 Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Face recognition is simulated (not actual ML)
- Payment is mock (no real transactions)
- Maps use placeholder visualization (integrate Google Maps/Leaflet in production)

## 🔒 Security Notes

- Use environment variables for sensitive data
- Implement rate limiting in production
- Use HTTPS in production
- Validate all inputs on backend
- Use prepared statements (already implemented)

## 📞 Support

For issues or questions, check the code comments or database schema documentation.
