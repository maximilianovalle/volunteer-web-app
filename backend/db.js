const {createPool} = require("mysql");

const pool = createPool({
    host: "cosc4353-volunteer-group18.mysql.database.azure.com",
    user: "iAmAnAdmin",
    password: "oadnAOPP77*",
    database: "volunteer_db",
    waitForConnections: true,
    connectionLimit: 10,
});
