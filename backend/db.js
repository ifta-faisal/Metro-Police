import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Your MySQL password
  database: 'metropolice',
  multipleStatements: false
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("Please check:");
    console.error("1. MySQL is running in XAMPP");
    console.error("2. Database 'metropolice' exists");
    console.error("3. Credentials in backend/db.js are correct");
  } else {
    console.log("✅ Connected to MySQL Database: metropolice");
  }
});

// Handle connection errors
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

export default db;