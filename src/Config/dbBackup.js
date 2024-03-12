const fs = require('fs');
const path = require('path');
const Backup = require('./Backup');
const db = require('../models');
const { exec } = require('child_process');

// Function to take a backup of the database
async function backupDatabase() {
    const backupDir = path.join(__dirname, 'backup');
    const backupFilename = `backup_.sql`;
    const backupFilePath = path.join(backupDir, backupFilename);

    try {
        process.env.PGPASSWORD = 'Password@123';
        const pgDumpCommand = `PGPASSWORD="${process.env.PGPASSWORD}" pg_dump --host=20.198.255.72 --port=5432 --username=postgres --dbname=isnew > ${backupFilePath}`;
        exec(pgDumpCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup failed: ${error}`);
            } else {
                console.log(`Backup successful: ${backupFilePath}`);
                Backup.backupDatabase(backupFilename);

                // Remove old backup files except the latest one
                fs.readdirSync(backupDir).forEach(file => {
                    if (file !== backupFilename) {
                        fs.unlinkSync(path.join(backupDir, file));
                    }
                });
            }
        });
    } catch (error) {
        console.error(`Backup failed: ${error}`);
    }
}

module.exports = { backupDatabase };

