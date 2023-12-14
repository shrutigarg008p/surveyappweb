const cron = require('node-cron');
const db = require('../models');
const {Op, DataTypes} = require("sequelize");
const {triggerSurveyEmail} = require("./ScheduleEmails");
const SurveyEmailSchedules = db.surveyEmailSchedule;


const processScheduledEmails = async () => {
    try {
        const currentDateTime = new Date();
        const emailsToBeSent = await SurveyEmailSchedules.findAll({
            where: {
                scheduleDate: {
                    [Op.lte]: currentDateTime,
                },
                scheduleStatus: 'Pending'
            },
        });
        for (const schedule of emailsToBeSent) {
            await triggerSurveyEmail(schedule.id)
            console.log(`Processed scheduled emails.`);
        }
    } catch (error) {
        console.error('Error processing scheduled emails:', error);
    }
};

const startScheduledEmailsCronJob = () => {
    cron.schedule('*/2 * * * * *', processScheduledEmails);
};

module.exports = { startScheduledEmailsCronJob };
