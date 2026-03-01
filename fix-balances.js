const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'bank.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Fixing balances for existing users...');

// Update any existing users who have 0 balance to have 5000
db.run("UPDATE users SET balance = 5000 WHERE balance = 0", function (err) {
    if (err) {
        console.error('Error updating balances:', err);
    } else {
        console.log(`Successfully updated ${this.changes} user(s) to have a $5000 balance.`);
    }
    db.close();
});
