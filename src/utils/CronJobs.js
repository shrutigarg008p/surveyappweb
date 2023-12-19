const cron = require('node-cron');
const db = require('../models');
const {Op, DataTypes} = require("sequelize");
const {triggerSurveyEmail, monkeyCron, questionPro} = require("./ScheduleEmails");
const {URL} = require("url");
const SurveyEmailSchedules = db.surveyEmailSchedule;
const SurveyPartners = db.surveyPartners;
const Partners = db.partners;
const Surveys = db.surveys;



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
            console.log(`Processed scheduled emails.`, schedule.id);
        }
    } catch (error) {
        console.error('Error processing scheduled emails:', error);
    }
};

const UpdateSurveyStatusTrigger = async () => {
    try {
        const currentDateTime = new Date();
        const completeSchedulers = await SurveyEmailSchedules.findAll({
            where: {
                deletedAt: null,
                scheduleStatus: 'Completed'
            },
        });
        console.log('completeSchedulers--->', completeSchedulers.length)
        if (completeSchedulers.length > 0) {
            for (const schedule of completeSchedulers) {
                console.log('surveyInfo--->', schedule.surveyId)
                const surveyInfo = await Surveys.findOne({
                    where: {
                        expiryDate: {
                            [Op.gte]: currentDateTime,
                        },
                        deletedAt: null,
                        id: schedule.surveyId,
                    }
                })
                console.log('surveyInfo--->', surveyInfo.id)
                if (surveyInfo) {
                    const partnerSurvey = await SurveyPartners.findOne({
                        where: {
                            surveyId: schedule.surveyId
                        }
                    })
                    console.log('partnerSurvey--->', partnerSurvey.partnerId)
                    if (partnerSurvey) {
                        const partnerInfo = await Partners.findOne({
                            where: {
                                id: partnerSurvey.partnerId,
                                deletedAt: null,
                            }
                        })
                        console.log('partnerInfo----->', partnerInfo.successUrl)
                        if (partnerInfo) {
                            const parsedUrl = new URL(partnerInfo.successUrl);
                            const domain = parsedUrl.hostname;
                            console.log('Domain:', domain);
                            if(domain === 'www.surveymonkey.com') {
                                await monkeyCron(surveyInfo.surveyUrlIdentifier, surveyInfo.id)
                            } else if(domain === 'questionpro.com') {
                                await questionPro(surveyInfo.surveyUrlIdentifier, surveyInfo.id)
                            } else {
                                console.log('Invalid Domain')
                            }
                        }
                    }
                }
                console.log(`Processed scheduled emails.`, schedule.id);
            }
        }
    } catch (err) {
        console.log('Error--->', err)
    }
}

const startScheduledEmailsCronJob = () => {
    // cron.schedule('*/2 * * * * *', processScheduledEmails); // Every 2 sec
    // cron.schedule('*/15 * * * *', processScheduledEmails); //Every 15 min
    cron.schedule('*/5 * * * * ', () => {
        processScheduledEmails();
        UpdateSurveyStatusTrigger()

    });
};

module.exports = { startScheduledEmailsCronJob };
