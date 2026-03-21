const mysql = require ('mysql2');

const db = mysql.createConnection({
    host: 'localhost' ,
    user: 'root',
    password: 'P@ssword1234',
    database: 'comp440'
});

db.connect((err) => {
    if (err) {
        console.error('Connection Failed. ' , err);
        return;
    }

    console.log('Connection Successful. ' , err);

});

module.exports = db;
