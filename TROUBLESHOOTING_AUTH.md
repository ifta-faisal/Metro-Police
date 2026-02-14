# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "Cannot connect to database" Error

**Symptoms:**
- Backend shows database connection error
- Registration/Login fails with database errors

**Solutions:**
1. **Check XAMPP MySQL is running:**
   - Open XAMPP Control Panel
   - Ensure MySQL is running (green status)
   - If not, click "Start" button

2. **Verify database exists:**
   ```sql
   -- In phpMyAdmin, run:
   SHOW DATABASES;
   -- Look for 'metropolice' database
   ```

3. **Create database if missing:**
   ```sql
   CREATE DATABASE IF NOT EXISTS metropolice;
   ```

4. **Check database credentials in `backend/db.js`:**
   ```javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'root',        // Your MySQL username
     password: '',         // Your MySQL password (if set)
     database: 'metropolice'
   });
   ```

### 2. "Table doesn't exist" Error

**Symptoms:**
- Error: "Table 'metropolice.users' doesn't exist"

**Solutions:**
1. **Import schema:**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Select `metropolice` database
   - Go to "Import" tab
   - Choose `database/schema.sql`
   - Click "Go"

2. **Or run SQL manually:**
   ```sql
   USE metropolice;
   
   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(100) UNIQUE,
     password VARCHAR(255),
     role ENUM('citizen', 'admin', 'officer') DEFAULT 'citizen',
     phone VARCHAR(20),
     nid VARCHAR(20) UNIQUE,
     address TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 3. "CORS Error" or "Network Error"

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors

**Solutions:**
1. **Ensure backend is running:**
   ```bash
   cd backend
   npm start
   ```
   Should see: "✅ Backend running on http://localhost:5000"

2. **Check backend URL in `src/utils/api.js`:**
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

3. **Verify ports:**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173 (or Vite's port)

### 4. "Invalid email or password" (but credentials are correct)

**Symptoms:**
- Login fails even with correct credentials
- Password was set before bcrypt was implemented

**Solutions:**
1. **Create a new account** (old accounts may have plain text passwords)
2. **Or update existing password:**
   ```sql
   -- In phpMyAdmin, manually hash a password:
   -- Use bcrypt with 10 rounds
   -- Or create a new account through registration
   ```

### 5. Registration Works but Login Fails

**Symptoms:**
- Can create account successfully
- But cannot login with same credentials

**Solutions:**
1. **Check password hashing:**
   - Registration uses bcrypt
   - Login compares with bcrypt
   - Ensure both are working

2. **Test with test-db.js:**
   ```bash
   cd backend
   node test-db.js
   ```

3. **Check browser console for errors**

### 6. "Token required" or Authentication Errors

**Symptoms:**
- Login seems successful but dashboard shows errors
- Token not being saved

**Solutions:**
1. **Clear browser storage:**
   - Open DevTools (F12)
   - Application tab → Local Storage
   - Clear all items
   - Try login again

2. **Check token in localStorage:**
   ```javascript
   // In browser console:
   localStorage.getItem('token')
   localStorage.getItem('user')
   ```

### 7. Testing Database Connection

**Run the test script:**
```bash
cd backend
node test-db.js
```

**Expected output:**
```
✅ Database connection successful!
✅ Users table exists
✅ Users table structure: [table shown]
```

## Step-by-Step Setup Verification

1. **Start XAMPP MySQL:**
   - ✅ MySQL status: Running

2. **Create/Verify Database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS metropolice;
   USE metropolice;
   ```

3. **Import Schema:**
   - Import `database/schema.sql` in phpMyAdmin

4. **Start Backend:**
   ```bash
   cd backend
   npm install  # If not done
   npm start
   ```
   - ✅ Should see: "✅ Connected to MySQL Database"

5. **Start Frontend:**
   ```bash
   npm install  # If not done
   npm run dev
   ```

6. **Test Registration:**
   - Go to http://localhost:5173/Register
   - Fill form and submit
   - Check browser console for errors
   - Check backend console for errors

7. **Test Login:**
   - Go to http://localhost:5173/Login
   - Use registered credentials
   - Should redirect to dashboard

## Quick Debug Commands

**Check backend logs:**
- Look at terminal where `npm start` is running
- Check for error messages

**Check frontend console:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Test API directly:**
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Still Having Issues?

1. Check all error messages in:
   - Backend terminal
   - Browser console
   - Network tab in DevTools

2. Verify:
   - ✅ MySQL is running
   - ✅ Database exists
   - ✅ Tables exist
   - ✅ Backend is running on port 5000
   - ✅ Frontend is running
   - ✅ No firewall blocking ports

3. Try:
   - Restart XAMPP
   - Restart backend server
   - Clear browser cache
   - Try in incognito mode
