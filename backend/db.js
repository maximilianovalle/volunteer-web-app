const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config(); 

// Set up DB config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL)
  }
};

// create connection pool - creates pool of multiple connections, prevents overload
const pool = mysql.createPool(dbConfig);

// convert to promise-based pool
const db_con = pool.promise();

// connect
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ Connected to MySQL database with SSL!");
  connection.release();
});

// export 
module.exports = db_con;

/*
db_con.connect(function (err) {
    if (err) {
        console.log("Error in the connection")
        console.log(err)
    }
    else {
        console.log(`Database Connected`)
        db_con.query(`SHOW DATABASES`,
            function (err, result) {
                if (err)
                    console.log(`Error executing the query - ${err}`)
                else
                    console.log("Result: ", result)
            })
    }
})
*/
