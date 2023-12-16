const db = require('../models');
const {Op, DataTypes} = require("sequelize");
const {surveyInvite} = require("../Config/Mails");
const SurveyEmailSchedules = db.surveyEmailSchedule;
const SurveyTemplates = db.surveyTemplates;
const Surveys = db.surveys;
const Samples = db.sample;
const Users = db.user;
const BasicProfile = db.basicProfile;
const AssignSurveys = db.asssignSurveys;


function calculateBirthDate(age) {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
}

function replaceVariables(html, variables) {
    return html.replace(/\{\{(.*?)\}\}/g, (match, variable) => {
        return variables[variable] || match;
    });
}

const triggerSurveyEmail = async (id) => {
    try {
        console.log('calling--->')
        const scheduleEmail = await SurveyEmailSchedules.findOne({where: {
                id: id,
                deletedAt: null,
                scheduleStatus: 'Pending'
        }})
        if (scheduleEmail) {
            const survey = await Surveys.findOne({
                where: {
                    id: scheduleEmail.surveyId,
                    isActive: true,
                    deletedAt: null,
                    closeDate: null,
                    isPaused: false,
                    expiryDate: {
                        [Op.gt]: new Date()
                    }
                }
            })
            if(survey) {
                const sample = await Samples.findOne({ where: { id: scheduleEmail.sampleId, deletedAt: null }})
                if(sample) {
                    let whereClause = {};

                    // Gender filter
                    if (sample.gender) {
                        whereClause.gender = sample.gender;
                    }

                    // Age filter
                    if (sample.fromAge || sample.toAge) {
                        whereClause.dateOfBirth = {
                            [Op.between]: [calculateBirthDate(sample.toAge), calculateBirthDate(sample.fromAge)]
                        };
                    }

                    // Registration date filter
                    if (sample.fromRegistrationDate && sample.toRegistrationDate) {
                        whereClause.createdAt = {
                            [Op.between]: [new Date(sample.fromRegistrationDate), new Date(sample.toRegistrationDate)]
                        };
                    }

                    // States filter
                    if (sample.stateIds && sample.stateIds.length > 0) {
                        const states = sample.stateIds.map((item =>  item.label ))
                        whereClause.state = {
                            [Op.in]: states
                        };
                    }

                    // Cities filter
                    if (sample.cityIds && sample.cityIds.length > 0) {
                        const city = sample.cityIds.map((item =>  item.label ))
                        whereClause.city = {
                            [Op.in]: city
                        };
                    }

                    BasicProfile.belongsTo(Users, { foreignKey: 'userId' });
                    console.log('whereClause--->', whereClause)
                    const users = await BasicProfile.findAll({
                        where: whereClause,
                        include: [
                            {
                                model: Users,
                                required: false,
                                attributes: ['email']
                            },
                        ],
                    });

                    console.log('result---->', users.length, scheduleEmail.surveyTemplateId)
                    if(users.length > 0) {
                       const emailTemplate = await SurveyTemplates.findOne({ where: { id: scheduleEmail.surveyTemplateId, deletedAt: null }})
                        if(emailTemplate) {
                            let sixDigitRandomNumber = Math.floor(100000 + Math.random() * 900000);
                            let assignedSurvey  = []
                            for( let i = 0; i < 1; i++ ) {
                                let link = ''
                                if (survey.useUniqueLinks === true) {
                                    sixDigitRandomNumber = Math.floor(100000 + Math.random() * 900000);
                                    link = `https://indiapolls.com:9000/surveys/${sixDigitRandomNumber}/${users[i].userId}`
                                } else {
                                    link = `https://indiapolls.com:9000/surveys/${sixDigitRandomNumber}/${users[i].userId}`
                                }
                                const data = {
                                    firstName: users[i].firstName,
                                    lastName: users[i].lastName,
                                    surveyName: survey.name,
                                    surveyDescription: survey.description,
                                    surveyLink: link
                                };
                                const processedHtml = replaceVariables(emailTemplate.body, data);
                                let insertRecord = {
                                    surveyId: survey.id,
                                    userId: users[i].userId,
                                    isStarted: false,
                                    isCompleted: false,
                                    isDisqualified: false,
                                    isOverQuota: false,
                                    isClosedSurvey: false,
                                    isOutlier: false,
                                    isRejected: false,
                                    pointsRewarded: 0,
                                    temporarySurveyLink: link,
                                    originalSurveyLink: survey.url,
                                    temporarySurveyLinkId: sixDigitRandomNumber,
                                    expiryDate: survey.expiryDate,
                                    createdAt: new Date().valueOf(),
                                    updatedAt: new Date().valueOf()
                                }
                                assignedSurvey.push(insertRecord)
                                await surveyInvite(emailTemplate.subject, users[i].user.email, processedHtml)
                            }
                                await AssignSurveys.bulkCreate(assignedSurvey)
                                await SurveyEmailSchedules.update({
                                    scheduleStatus: 'Completed',
                                    emailsCreatedAt: new Date().valueOf()
                                }, { where: { id: scheduleEmail.id }})
                            }

                        }
                    }

                }
            }

    } catch (err) {
        console.log('error---->', err)
    }
}

module.exports = {
    triggerSurveyEmail
}


