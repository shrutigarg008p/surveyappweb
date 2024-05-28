const cron = require('node-cron');
const db = require('../models');
const {Op, DataTypes} = require("sequelize");
const {triggerSurveyEmail, monkeyCron, questionPro} = require("./ScheduleEmails");
const {URL} = require("url");
const axios = require('axios');
const SurveyEmailSchedules = db.surveyEmailSchedule;
const SurveyPartners = db.surveyPartners;
const Partners = db.partners;
const Surveys = db.surveys;
const XoxoTokens = db.xoxoTokens;




const processScheduledEmails = async () => {
    try {
        const currentDateTime = new Date();
        const emailsToBeSent = await SurveyEmailSchedules.findAll({
            where: {
                scheduleDate: {
                    [Op.lte]: currentDateTime,
                },
                deletedAt: null,
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
                scheduleStatus: 'Sent'
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


const xoxoTokenRenewal = async () => {
    try {
        const info = await XoxoTokens.findOne()
        console.log('CALLING---', info)
        let data = JSON.stringify({
            "grant_type": info.grant_type,
            "refresh_token": info.refresh_token, //"39766d45134a7002557c30bfc8bd1cca773c1d28",
            "client_id": info.client_id, //"93fecb0c34c4dd2f98da277fac7dccb9",
            "client_secret": info.client_secret, // "vi9mgguadxzwncme9h0s7a1b04dj5o3zqne6kb34v1q6"
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://accounts.xoxoday.com/chef/v1/oauth/token/user',
            headers: {
                'Cookie': '_cfuvid=0Wp8thR1Ym4sZviO3S3sIMw6Wy9s8B.4q1bLMA20wHA-1716796031187-0.0.1.1-604800000; __cf_bm=UWh3TneJxJam2rHKjI5jD2g9byRhC0yK81utaDxegyY-1716919572-1.0.1.1-sUnvnWS1eugizdML1MV9cQt5GJzuIU9XMOoWJfI3Dvw1e5ap2GS_h27kW7rMZ.Bd.M8PlNFVPdDNv7HjHZklgw; _cfuvid=6.zrCk7R_45uY2TMWob7J2JlHg2BuhU9haz_M_TYN4k-1716920018612-0.0.1.1-604800000',
                'Content-Type': 'application/json'
            },
            data : data
        };

        console.log('CALLING-config--', config)
        axios.request(config)
            .then(async (response) => {
                console.log(JSON.stringify(response.data));
                await XoxoTokens.update({ access_token: response.data.access_token, refresh_token: response.data.refresh_token }, { where: { id: '36c185df-5be7-4a08-83de-bdb7df42b767' }})
            })
            .catch((error) => {
                console.log(error);
            });

    } catch (error) {
        console.error('Error processing scheduled emails:', error);
    }
};

const startScheduledEmailsCronJob = () => {
    // cron.schedule('*/2 * * * * *', processScheduledEmails); // Every 2 sec
    // cron.schedule('*/5 * * * *', processScheduledEmails); //Every 15 min
    cron.schedule('*/5 * * * * ', () => {
        processScheduledEmails();
        // UpdateSurveyStatusTrigger()

    });
};

const startScheduledStatusCronJob = () => {
    // cron.schedule('*/2 * * * * *', processScheduledEmails); // Every 2 sec
    // cron.schedule('*/15 * * * *', processScheduledEmails); //Every 15 min
    cron.schedule('*/30 * * * * ', () => {
        // processScheduledEmails();
        UpdateSurveyStatusTrigger()

    });
};

cron.schedule('0 0 * * *', async () => {
    const info = await XoxoTokens.findOne()
    let counter = info.counter;
    counter += 1;

    if (counter >= 13) {
        xoxoTokenRenewal(); // Run the task
        counter = 0; // Reset the counter
    }

    await XoxoTokens.update({ counter: counter }, { where: { id: '36c185df-5be7-4a08-83de-bdb7df42b767' }})

});


module.exports = { startScheduledEmailsCronJob, startScheduledStatusCronJob };
