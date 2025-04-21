const mysql = require("mysql2");
require("dotenv").config(); 

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true  
  }
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

promisePool.getConnection()
  .then(connection => {
    console.log("✅ Connected to MySQL database with SSL!");
    connection.release();
  })
  .catch(err => {
    console.error("❌ MySQL Connection Error:", err);
  });

module.exports = promisePool;
