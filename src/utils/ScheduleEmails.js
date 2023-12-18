const db = require('../models');
const {Op, DataTypes} = require("sequelize");
const { URL } = require('url');
const axios = require('axios');
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
                                    status: 'pending',
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

const monkeyCron = async (id, surveyId) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.surveymonkey.com/v3/surveys/${id}/responses/bulk`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer tOt-QCvM5tKO73Krcx3Kwe4d0z1NIzdshw.GbENnC2XbMaUhZ9wLaZWbYMUtvXMF5JGZYhjdYH4sAiKo8DvhTpCPYom7i4m43n3Mrt21RD7aNTQv1LmCNN4aluc5JGDR',
            'Cookie': 'attr_multitouch="yD//P8q3ZlnM34fwaCqP4Lwz34k="; cdp_seg="hT1pBWP5PpzsSumonxF63JY1kq0="; ep201="cY14kpTNgMeyqPVHKQ9sXVOFoVQ="; ep202="KVRIDiURxVtYZl8266oMGEHveVE="; ep203="fCyYyK4sFFuSj2UuvTp9RJh++/M="'
        }
    };

    axios.request(config)
        .then(async (response) => {
            const surveyData = response.data
            const groupedData = {};
            surveyData.data.forEach(response => {
                const ip_address = response.ip_address;
                if (!groupedData[ip_address]) {
                    groupedData[ip_address] = [];
                }
                groupedData[ip_address].push(response);
            });
            const groupedDataArray = Object.entries(groupedData).map(([ip_address, responses]) => ({
                ip_address,
                responses,
            }));
            const resultJson = {groupedData: groupedDataArray};
            const processedData = resultJson.groupedData.map(ipGroup => {
                const hasCompleted = ipGroup.responses.some(response => response.response_status === 'completed');
                const latestDateModified = ipGroup.responses.reduce((latestDate, response) => {
                    const dateModified = new Date(response.date_modified).getTime();
                    return dateModified > latestDate ? dateModified : latestDate;
                }, 0);
                const status = hasCompleted ? 'completed' : ipGroup.responses.find(response => new Date(response.date_modified).getTime() === latestDateModified).response_status;
                return {
                    ip_address: ipGroup.ip_address,
                    status,
                };
            });
            const results = {processedData};
            if (results && results.processedData.length > 0) {
                for (const processed of results.processedData) {
                    const user = await Users.findOne({
                        where: {
                            signupIp: {
                                [Op.like]: `::ffff:${processed.ip_address}`,
                            },
                        },
                    });
                    if (user) {
                        await AssignSurveys.update({
                            status: processed.status
                        }, {
                            where: {
                                userId: user.id,
                                surveyId: surveyId
                            }
                        })
                    }
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });

}

const questionPro = async (id, surveyId) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.questionpro.com/a/api/v2/surveys/11783740/responses?page=1&perPage=10000&apiKey=3e158e6c-f112-4925-b1dc-ec1406881337',
        headers: {
            'Cookie': 'api=86c488cb5f1515dc514a304b45c39121; JSESSIONID=aaaQpmCHyrC1z7NxefNXy'
        }
    };

    axios.request(config)
        .then(async (response) => {
            const surveyData = response.data
            const groupedData = {};
            surveyData.response.forEach(response => {
                const ipAddress = response.ipAddress;
                if (!groupedData[ipAddress]) {
                    groupedData[ipAddress] = [];
                }
                groupedData[ipAddress].push(response);
            });
            const groupedDataArray = Object.entries(groupedData).map(([ipAddress, responses]) => ({
                ipAddress,
                responses,
            }));
            const resultJson = {groupedData: groupedDataArray};
            const processedData = resultJson.groupedData.map(ipGroup => {
                const hasCompleted = ipGroup.responses.some(response => response.responseStatus === 'completed');
                const latestDateModified = ipGroup.responses.reduce((latestDate, response) => {
                    const dateModified = new Date(response.utctimestamp).getTime();
                    return dateModified > latestDate ? dateModified : latestDate;
                }, 0);
                const status = hasCompleted ? 'completed' : ipGroup.responses.find(response => new Date(response.utctimestamp).getTime() === latestDateModified).responseStatus;
                return {
                    ipAddress: ipGroup.ipAddress,
                    status,
                };
            });
            const results = {processedData};
            if (results && results.processedData.length > 0) {
                for (const processed of results.processedData) {
                    const user = await Users.findOne({
                        where: {
                            signupIp: {
                                [Op.like]: `::ffff:${processed.ipAddress}`,
                            },
                        },
                    });
                    if (user) {
                        await AssignSurveys.update({
                            status: processed.status
                        }, {
                            where: {
                                userId: user.id,
                                surveyId: surveyId
                            }
                        })
                    }
                }
            }
        })
        .catch((error) => {
            console.log(error);
        });

}

module.exports = {
    triggerSurveyEmail,
    monkeyCron,
    questionPro
}

