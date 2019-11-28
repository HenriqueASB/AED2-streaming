const mysql = require('mysql');

var sql = {
    execSQLQuery: function(sqlQry, res){
  const connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'aed2',
    password : '',
    database : 'aed2'
  });

  console.log(sqlQry)
 
 connection.query(sqlQry, (err, rows) => {
    if (err) throw err;

    res.json(rows)

  });
}
}
module.exports = {sql}