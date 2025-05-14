const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            major TEXT,
            semester TEXT,
            birthday TEXT,
            photo TEXT
        )
    `);
});

module.exports = db;
