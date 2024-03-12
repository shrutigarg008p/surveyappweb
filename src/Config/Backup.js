const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class Backup {
    static async backupDatabase(filename) {
        try {
            const backupDir = path.join(__dirname, 'backup');
            const backupFile = path.join(backupDir, filename);

            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir);
            }

            process.env.PGPASSWORD = 'Password@123';
            const pgDumpCommand = `PGPASSWORD="${process.env.PGPASSWORD}" pg_dump --host=20.198.255.72 --port=5432 --username=postgres --dbname=isnew > ${backupFile}`;
            exec(pgDumpCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Backup failed:', error);
                } else {
                    console.log('Backup completed successfully:', backupFile);
                }
            });
        } catch (error) {
            console.error('Error during database backup:', error);
        }
    }
}

module.exports = Backup;
