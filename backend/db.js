const mysql = require("mysql");
const fs = require('fs')

const db_con = mysql.createConnection({
    host: "cosc4353-volunteer-group18.mysql.database.azure.com",
    user: "iAmAnAdmin",
    password: "oadnAOPP77*",
    database: "volunteer_db",
    port: "3306",
    ssl: {ca: fs.readFileSync("../backend/DigiCertGlobalRootCA.crt.pem")}

});
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

module.exports = db_con;