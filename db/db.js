const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  connectionLimit: 20,
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'piano',
  waitForConnections: true,
  queueLimit: 0,
});


module.exports = {
  query: (sql, values) => {
    return pool.execute(sql, values)
      .then(([results, fields]) => {
        return results;
      })
      .catch((err) => {
        throw err;
      });
  },
  pool: pool,
};
