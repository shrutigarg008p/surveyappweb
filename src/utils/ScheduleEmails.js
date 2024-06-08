const db = require('../models');
const {Op, DataTypes, Sequelize} = require("sequelize");
const { URL } = require('url');
const axios = require('axios');
const {surveyInvite} = require("../Config/Mails");
const apiResponses = require("../Components/apiresponse");
const {Notifications, notificationCreate} = require("../Config/Notification");
const {sendSurveyMessage, sendSurveyMessageHindi} = require("../Config/Sms");
const SurveyEmailSchedules = db.surveyEmailSchedule;
const SurveyTemplates = db.surveyTemplates;
const Surveys = db.surveys;
const Samples = db.sample;
const States = db.states;
const Users = db.user;
const BasicProfile = db.basicProfile;
const ProfileUserResponses = db.profileUserResponse;
const AssignSurveys = db.asssignSurveys;
const SampleQuestions = db.sampleQuestions;
const Cities = db.city;
const SurveyUniqueLinks = db.surveyUniqueLinks;


function calculateBirthDate(age) {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
}


function mapGender(gender) {
    return gender === 'Male' ? ["Male", 'male', 'पुरुष'] :
        gender === 'Female' ? ["Female", "महिला", 'female'] :
            ["Other", 'other', "अन्य"];
}

function replaceVariables(html, variables) {
    return html.replace(/\{\{(.*?)\}\}/g, (match, variable) => {
        return variables[variable] || match;
    });
}

function appendParamsToUrl(baseUrl, userId, surveyId) {
    let url = new URL(baseUrl);
    if (url.search) {
        url.search += `&userid=${userId}&surveyid=${surveyId}`;
    } else {
        url.search = `?userid=${userId}&surveyid=${surveyId}`;
    }
    url = url.toString().replace("{userid}", userId);
    return url.toString();
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
            if (survey) {
                if (survey.useUniqueLinks === false) {

                    SurveyEmailSchedules.update({
                        scheduleStatus: 'Sent',
                        emailsCreatedAt: new Date()
                    }, {where: {id: scheduleEmail.id}})

                    const sample = await Samples.findOne({where: {id: scheduleEmail.sampleId, deletedAt: null}})
                    if (survey && sample) {
                        const sampleQuestions = await SampleQuestions.findAll({
                            where: {
                                sampleId: sample.id,
                                deletedAt: null
                            }
                        })
                        if (sample) {
                            let limit = 1000000;
                            if (sample.profileCount > 0) {
                                limit = sample.profileCount;
                            }

                            let whereClause = {};
                            // Age filter
                            if (sample.fromAge || sample.toAge) {
                                whereClause.dateOfBirth = {
                                    [Op.between]: [calculateBirthDate(sample.toAge), calculateBirthDate(sample.fromAge)]
                                };
                            }

                            // Gender filter
                            if (sample.gender) {
                                whereClause.gender = {
                                    [Op.in]: sample.gender === 'Male' ? ["Male", 'male', 'पुरुष'] : sample.gender === 'Female' ? ["Female", "महिला", 'female'] : ["Others", 'others', "अन्य"]
                                };
                            }


                            let genderWhereClosure = []
                            if (sample.genders && sample.genders.length > 0) {
                                sample.genders.length > 0 && sample.genders.forEach(range => {
                                    const {gender, fromAge, toAge} = range;
                                    if (gender !== undefined && fromAge !== undefined && toAge !== undefined) {
                                        const today = new Date();
                                        const birthDateFrom = new Date(today.getFullYear() - toAge, today.getMonth(), today.getDate());
                                        const birthDateTo = new Date(today.getFullYear() - fromAge, today.getMonth(), today.getDate());

                                        const formattedBirthDateFrom = `to_date('${birthDateFrom.toISOString().split('T')[0]}', 'YYYY-MM-DD')`;
                                        const formattedBirthDateTo = `to_date('${birthDateTo.toISOString().split('T')[0]}', 'YYYY-MM-DD')`;

                                        const mappedGender = gender.flatMap(g => mapGender(g.label));

                                        const condition = {
                                            [Op.and]: [
                                                Sequelize.literal(`to_date("basic_profile"."dateOfBirth", 'YYYY-MM-DD') BETWEEN ${formattedBirthDateFrom} AND ${formattedBirthDateTo}`),
                                                Sequelize.literal(`ARRAY[${mappedGender.map(g => `'${g}'`).join(',')}]::text[] @> ARRAY["basic_profile"."gender"]::text[]`)
                                            ]
                                        };
                                        genderWhereClosure.push(condition);
                                    }
                                });
                            }


                            let genderClause = {}
                            if (genderWhereClosure.length > 0) {
                                genderClause = {
                                    [Op.or]: genderWhereClosure
                                };
                            }


                            // Registration date filter
                            if (sample.fromRegistrationDate || sample.toRegistrationDate) {
                                whereClause.createdAt = {
                                    [Op.between]: [new Date(sample.fromRegistrationDate), new Date(sample.toRegistrationDate)]
                                };
                            }

                            //--Temp
                            let allCities = []
                            if (sample.stateIds && sample.stateIds.length > 0) {
                                const states = sample.stateIds.map((item => item.value))
                                const statesInfo = await Cities.findAll({
                                    where: {stateId: {[Op.in]: states}},
                                    attributes: ['name', 'hindi', 'zipCode'],
                                    raw: true
                                })
                                const zipcodes = statesInfo.map(item => item.zipCode);
                                const names = statesInfo.map(item => item.name);
                                const hindiNames = statesInfo.map(item => item.hindi);
                                const stringArray = names.concat(hindiNames);
                                allCities.push(...zipcodes);
                            }

                            // Cities filter
                            if (sample.cityIds && sample.cityIds.length > 0) {
                                const city = sample.cityIds.map((item => item.label))
                                const statesInfo = await Cities.findAll({
                                    where: {name: {[Op.in]: city}},
                                    attributes: ['name', 'hindi', 'zipCode'],
                                    raw: true
                                })
                                const zipcodes = statesInfo.map(item => item.zipCode);
                                const names = statesInfo.map(item => item.name);
                                const hindiNames = statesInfo.map(item => item.hindi);
                                const stringArray = names.concat(hindiNames);
                                allCities.push(...zipcodes);

                            }

                            //Segments
                            if (sample.segments && sample.segments.length > 0) {
                                let obj = {}
                                const segments = sample.segments.map((item => item.label))
                                obj.segment = {
                                    [Op.in]: segments
                                };
                                const segmentsCities = await Cities.findAll({
                                    where: obj,
                                    attributes: ['name', 'hindi', 'zipCode'],
                                    raw: true
                                })
                                if (segmentsCities.length > 0) {
                                    const zipcodes = segmentsCities.map(item => item.zipCode);
                                    const names = segmentsCities.map(item => item.name);
                                    const hindiNames = segmentsCities.map(item => item.hindi);
                                    const stringArray = names.concat(hindiNames);
                                    allCities.push(...zipcodes);
                                }
                            }

                            //Regions
                            if (sample.regions && sample.regions.length > 0) {
                                let obj = {}
                                const regions = sample.regions.map((item => item.label))
                                obj.region = {
                                    [Op.in]: regions
                                };
                                const regionsCities = await Cities.findAll({
                                    where: obj,
                                    attributes: ['name', 'region', 'zipCode'],
                                    raw: true
                                })
                                if (regionsCities.length > 0) {
                                    const zipcodes = regionsCities.map(item => item.zipCode);
                                    const names = regionsCities.map(item => item.name);
                                    const hindiNames = regionsCities.map(item => item.hindi);
                                    const stringArray = names.concat(hindiNames);
                                    allCities.push(...zipcodes);
                                }
                            }

                            if (allCities.length > 0) {
                                whereClause.pinCode = {
                                    [Op.in]: allCities
                                };
                            }

                            whereClause = {
                                [Op.and]: [
                                    whereClause,
                                    genderClause
                                ]
                            };

                            BasicProfile.belongsTo(Users, {foreignKey: 'userId'});
                            console.log('whereClause--->', whereClause)
                            let usersQuery = await BasicProfile.findAll({
                                where: whereClause,
                                include: [
                                    {
                                        model: Users,
                                        required: false,
                                        attributes: ['email', 'role', 'devicetoken']
                                    },
                                ],
                                limit: limit,
                                order: [
                                    [Sequelize.fn('RANDOM')],
                                    ['gender']
                                ],
                            });

                            if (sampleQuestions.length > 0) {
                                let usersResponseList = await filterUserResponses(sampleQuestions);
                                const userIdArray = usersResponseList.map(userResponse => userResponse.get('userId'));
                                let usersQuestionCriteria = await BasicProfile.findAll({
                                    where: {
                                        userId: {
                                            [Op.in]: userIdArray,
                                        },
                                    },
                                    include: [
                                        {
                                            model: Users,
                                            required: false,
                                            attributes: ['email', 'role', 'devicetoken', 'phoneNumber']
                                        },
                                    ],
                                    order: [['gender', 'ASC']],
                                })
                                const filterCommonUsers = (arrA, arrB) => {
                                    return arrA.filter(userA => arrB.some(userB => userB.userId === userA.userId));
                                };
                                usersQuery = filterCommonUsers(usersQuestionCriteria, usersQuery);
                            }

                            let users = usersQuery.filter(item => item.user ? item.user.role === 'panelist' : '')
                            console.log('result---->', users.length, scheduleEmail.surveyTemplateId)
                            if (users.length > 0) {
                                const emailTemplate = await SurveyTemplates.findOne({
                                    where: {
                                        id: scheduleEmail.surveyTemplateId,
                                        deletedAt: null
                                    }
                                })

                                //New one----
                                if (emailTemplate) {
                                    let totalUsers = 0
                                    if (scheduleEmail.count > 0) {
                                        totalUsers = scheduleEmail.count
                                    } else {
                                        totalUsers = users.length;
                                    }
                                    console.log('totalUsers--Email--Count-->', totalUsers)
                                    const batchSize = Math.min(totalUsers, users.length); // Define maximum batch size

                                    const batchedUsers = [];
                                    for (let i = 0; i < totalUsers; i += batchSize) {
                                        batchedUsers.push(users.slice(i, i + batchSize));
                                    }

                                    const processBatch = async (batch) => {
                                        const assignedSurvey = [];
                                        const notificationsArray = [];
                                        const emailsArray = [];
                                        const smsArray = [];

                                        // Process each user in the batch
                                        for (let i = 0; i < batch.length; i++) {
                                            const user = batch[i];
                                            let link = '';

                                            if (survey.useUniqueLinks === true) {
                                                link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${user.userId}`;
                                            } else {
                                                link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${user.userId}`;
                                            }

                                            const data = {
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                surveyName: survey.name,
                                                surveyDescription: survey.description,
                                                surveyLink: link
                                            };

                                            // Replace variables in email body
                                            const processedHtml = replaceVariables(emailTemplate.body, data);

                                            // Prepare record for bulk insert
                                            const insertRecord = {
                                                surveyId: survey.id,
                                                userId: user.userId,
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
                                                originalSurveyLink: appendParamsToUrl(survey.url, user.userId, survey.uniqueid),
                                                temporarySurveyLinkId: survey.uniqueid,
                                                expiryDate: survey.expiryDate,
                                                createdAt: new Date(),
                                                updatedAt: new Date()
                                            };
                                            assignedSurvey.push(insertRecord);


                                            // Send email to user
                                            // emailsArray.push(surveyInvite(emailTemplate.subject, user.user.email, processedHtml));

                                            // Send SMS to user
                                            smsArray.push(sendSurveyMessage(`${user.firstName} ${user.lastName}`, link, user.mobile, survey.name));

                                            if (user.user.devicetoken) {
                                                // notificationsArray.push(Notifications(user.user.devicetoken, emailTemplate.subject, 'New survey has been assigned to you'));
                                                const notificationInfo = {
                                                    userId: user.userId,
                                                    message: `You have assigned ${survey.name} survey`,
                                                    type: 'survey',
                                                    id: survey.id
                                                };
                                                // notificationsArray.push(notificationCreate(notificationInfo));
                                            }
                                        }

                                        console.log('assignedSurvey--->', assignedSurvey.length)
                                        // Execute bulk operations
                                        await Promise.all([
                                            AssignSurveys.bulkCreate(assignedSurvey),
                                            SurveyEmailSchedules.update({
                                                scheduleStatus: 'Sent',
                                                emailsCreatedAt: new Date()
                                            }, {where: {id: scheduleEmail.id}}),
                                            // ...emailsArray,
                                            ...smsArray,
                                            ...notificationsArray
                                        ]);
                                    };

                                    // Process each batch of users asynchronously
                                    for (const batch of batchedUsers) {
                                        await processBatch(batch);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    SurveyUniqueLinks.belongsTo(Users, {foreignKey: 'userId'});
                    Users.belongsTo(BasicProfile, {foreignKey: 'id'});
                    const users = await SurveyUniqueLinks.findAll({
                        where: {
                            surveyId: scheduleEmail.surveyId,
                            sampleId: scheduleEmail.sampleId,
                            schedulerId: scheduleEmail.id,
                        },
                        include: [
                            {
                                model: Users,
                                required: true,
                                attributes: ['devicetoken', 'email', 'id'],
                                include: [
                                    {
                                        model: BasicProfile,
                                        required: true,
                                        attributes: ['firstName', 'lastName', 'mobile'],
                                    }
                                ]
                            }
                        ]
                    })

                    SurveyEmailSchedules.update({
                        scheduleStatus: 'Sent',
                        emailsCreatedAt: new Date()
                    }, {where: {id: scheduleEmail.id}})

                    if (users.length > 0) {
                        const emailTemplate = await SurveyTemplates.findOne({
                            where: {
                                id: scheduleEmail.surveyTemplateId,
                                deletedAt: null
                            }
                        })

                        //New one----
                        if (emailTemplate) {
                            let totalUsers = 0
                            if (scheduleEmail.count > 0) {
                                totalUsers = scheduleEmail.count
                            } else {
                                totalUsers = users.length;
                            }
                            console.log('totalUsers--Email--Count-->', totalUsers)
                            const batchSize = Math.min(totalUsers, users.length); // Define maximum batch size

                            const batchedUsers = [];
                            for (let i = 0; i < totalUsers; i += batchSize) {
                                batchedUsers.push(users.slice(i, i + batchSize));
                            }

                            const processBatch = async (batch) => {
                                const assignedSurvey = [];
                                const notificationsArray = [];
                                const emailsArray = [];
                                const smsArray = [];

                                // Process each user in the batch
                                for (let i = 0; i < batch.length; i++) {
                                    const user = batch[i];
                                    let link = '';
                                    const case_id = Math.floor(1000 + Math.random() * 9000);

                                    if (survey.useUniqueLinks === true) {
                                        link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${user.user.id}`;
                                    } else {
                                        link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${user.user.id}`;
                                    }

                                    const data = {
                                        firstName: user.user.basic_profile.firstName,
                                        lastName: user.user.basic_profile.firstName,
                                        surveyName: survey.name,
                                        surveyDescription: survey.description,
                                        surveyLink: link
                                    };

                                    // Replace variables in email body
                                    const processedHtml = replaceVariables(emailTemplate.body, data);

                                    // Prepare record for bulk insert
                                    const insertRecord = {
                                        surveyId: survey.id,
                                        userId: user.user.id,
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
                                        originalSurveyLink: appendParamsToUrl(user.link, user.user.id, survey.uniqueid),
                                        temporarySurveyLinkId: survey.uniqueid,
                                        expiryDate: survey.expiryDate,
                                        case_id: case_id,
                                        createdAt: new Date(),
                                        updatedAt: new Date()
                                    };
                                    assignedSurvey.push(insertRecord);


                                    // Send email to user
                                    // emailsArray.push(surveyInvite(emailTemplate.subject, user.user.email, processedHtml));

                                    // Send SMS to user
                                    smsArray.push(sendSurveyMessage(`${user.user.basic_profile.firstName} ${user.user.basic_profile.lastName}`, link, user.user.basic_profile.mobile, survey.name));

                                    if (user.user.devicetoken) {
                                        notificationsArray.push(Notifications(user.user.devicetoken, emailTemplate.subject, 'New survey has been assigned to you'));
                                        const notificationInfo = {
                                            userId: user.user.id,
                                            message: `You have assigned ${survey.name} survey`,
                                            type: 'survey',
                                            id: survey.id
                                        };
                                        notificationsArray.push(notificationCreate(notificationInfo));
                                    }
                                }

                                console.log('assignedSurvey--->', assignedSurvey.length)
                                // Execute bulk operations
                                await Promise.all([
                                    AssignSurveys.bulkCreate(assignedSurvey),
                                    SurveyEmailSchedules.update({
                                        scheduleStatus: 'Sent',
                                        emailsCreatedAt: new Date()
                                    }, {where: {id: scheduleEmail.id}}),
                                    // ...emailsArray,
                                    ...smsArray,
                                    ...notificationsArray
                                ]);
                            };

                            // Process each batch of users asynchronously
                            for (const batch of batchedUsers) {
                                await processBatch(batch);
                            }
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
                    console.log('processed.ip_address---->', processed.ip_address)
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
        url: `https://api.questionpro.com/a/api/v2/surveys/${id}/responses?page=1&perPage=10000&apiKey=3e158e6c-f112-4925-b1dc-ec1406881337`,
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

const filterUserResponses = async (sampleQuestions) => {
    const allUserResponses = await ProfileUserResponses.findAll({
        where: {
            deletedAt: null,
        },
    });

    const Operands = {
        All: 1,
        ANSWERED: 2,
        ANY: 3,
        EXCEPT: 4,
        NOT_ANSWERED: 5,
    };

    return allUserResponses.filter(userResponse => {
        return sampleQuestions.every(({ questionId, operand, optionIds }) => {
            const responseValue = userResponse.get('response')[questionId];

            const checkOptionValue = (value) => {
                if (Array.isArray(optionIds)) {
                    return Array.isArray(value)
                        ? optionIds.every(opt => value.includes(opt))
                        : optionIds.includes(value);
                } else {
                    return Array.isArray(value)
                        ? value.includes(optionIds)
                        : value === optionIds;
                }
            };

            switch (operand) {
                case Operands.All:
                    return responseValue && checkOptionValue(responseValue);
                case Operands.ANSWERED:
                    return responseValue && checkOptionValue(responseValue);
                case Operands.ANY:
                    return responseValue;
                case Operands.EXCEPT:
                    return !(responseValue && checkOptionValue(responseValue));
                case Operands.NOT_ANSWERED:
                    return !(responseValue && checkOptionValue(responseValue));
                default:
                    // Handle default case if needed
                    return false;
            }
        });
    });
};

module.exports = {
    triggerSurveyEmail,
    monkeyCron,
    questionPro
}
