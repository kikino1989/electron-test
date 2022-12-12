const sqlite3 = require('sqlite3').verbose();

const dbmap = {};

const closed_dbmap = {};


function openDatabase(options) {
    if (!Array.isArray(options)) {
      return Promise.reject(new Error('Open database options not provided.'));
    }
  
    const name = options[0].name;
    if (!name) {
      return Promise.reject(new Error('Open database name option not provided.'));
    }
  
    if (!!dbmap[name]) {
      return Promise.resolve();
    }
  
    if (!!closed_dbmap[name]) {
      const db = dbmap[name] = closed_dbmap[name];
      delete closed_dbmap[name];
      try {
        db.exec('ROLLBACK');
      } catch (e) { }
      return Promise.resolve();
    }
  
    return new Promise((resolve, reject) => {
      try {
        dbmap[name] = new sqlite3.Database(name, e => {
          if (!!e) {
            return reject(e);
          }
          resolve();
        });
      } catch (e) {
        return reject(e);
      }
    });
}

async function backgroundExecuteSqlBatch(options) {
  if (!Array.isArray(options)) {
    return Promise.reject(new Error('Open database options not provided.'));
  }

  const dbname = options[0].name;
  const db = dbmap[dbname];
  if (!db) {
    return Promise.reject(`Database with name ${dbname} not found.`);
  }

  return Promise.all(options[0].executes.map((e, i) => {
    if (e[i]) {
      e = e[i];
    }

    const sql = e.sql;
    const params = e.params;
    return executeSql(db, sql, params);
  }));
}

function executeSql(db, sql, params) {
  return new Promise((resolve, reject) => {
    var _sqlite3Handler = function (e, r) {
      if (!!e) {
        return reject(new Error(e.toString()));
      }
      
      resolve({
        type: 'success',
        result:
          this['changes'] && this['changes'] !== 0
            ? {
              rows: r,
              insertId: this['lastID'],
              rowsAffected: this['changes'],
            }
            : {
              rows: r,
              rowsAffected: 0,
            },
      });
    };

    if (sql.substr(0, 11) === 'INSERT INTO') {
      return db.run(sql, params, _sqlite3Handler);
    }

    db.all(sql, params, _sqlite3Handler);
  });
}

function closeDatabase(options) {
  if (!Array.isArray(options)) {
    return Promise.reject(new Error('Open database options not provided.'));
  }

  const dbname = options[0].path;
  const db = dbmap[dbname];
  if (!db) {
    return Promise.resolve();
  }

  closed_dbmap[dbname] = dbmap[dbname];
  delete dbmap[dbname];
}

function deleteDatabase(options) {
  if (!Array.isArray(options)) {
    return Promise.reject(new Error('Open database options not provided.'));
  }

  const dbname = options[0].path;
  if (!!closed_dbmap[dbname]) {
    delete closed_dbmap[dbname];
    return Promise.resolve();
  }

  var db = dbmap[dbname];
  if (!db) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.close(error => {
      if (!!error) {
        return reject(error);
      }
      delete dbmap[dbname];
      resolve();
    });
  });
}

module.exports = {
  openDatabase: openDatabase,
  closeDatabase: closeDatabase,
  backgroundExecuteSqlBatch: backgroundExecuteSqlBatch,
  deleteDatabase: deleteDatabase
};