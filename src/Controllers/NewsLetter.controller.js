const db = require('../models');
const NewsLetters = db.newsletters;
const NewsLettersSamples = db.newslettersSamples;
const apiResponses = require('../Components/apiresponse');
const Samples = db.sample;
const States = db.states;
const Users = db.user;
const BasicProfile = db.basicProfile;
const ProfileUserResponses = db.profileUserResponse;
const Cities = db.city;
const SampleQuestions = db.sampleQuestions;
const {newsLetterMail, surveyInvite} = require("../Config/Mails");
const {Op, Sequelize} = require("sequelize");
const {sendSurveyMessage} = require("../Config/Sms");
const {Notifications, notificationCreate} = require("../Config/Notification");

module.exports.create = async (req, res) => {
    try {
            const Survey = await NewsLetters.create({
                name: req.body.name,
                subject: req.body.subject,
                body: req.body.body,
                emails: req.body.emails,
                sendDate: req.body.sendDate,
                createdById: req.body.createdById,
                newsletterStatus: req.body.newsletterStatus,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            const labelsArray = req.body.emails.map(item => item.label)
            await newsLetterMail(req.body.body, labelsArray, req.body.subject)

            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Survey
            );
    } catch (err) {
        console.log(err)
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.update = async (req, res) => {
    try {
        let obj = {
            name: req.body.name,
            subject: req.body.subject,
            body: req.body.body,
            emails: req.body.emails,
            sendDate: req.body.sendDate,
            createdById: req.body.createdById,
            newsletterStatus: req.body.newsletterStatus,
            updatedAt: new Date().valueOf(),
        }
        const user = await NewsLetters.update( obj, {where: {id: req.params.id}})
        return apiResponses.successResponseWithData(res, 'Success Update', user);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await NewsLetters.findAll({ where: { deletedAt: null }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        let data = await NewsLetters.findOne({where: {id: req.params.id, deletedAt: null}})
        if(data) {
            const newsletterSample = await NewsLettersSamples.findOne({where: {newsletter_id: req.params.id, deletedAt: null}})
            data = { ...data.toJSON(), newsletterSample };
        }
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await NewsLetters.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};



module.exports.createNewsletterSamples = async (req, res) => {
    try {
        let data = await NewsLettersSamples.findOne({where: {
            newsletter_id: req.body.newsletter_id,
            deletedAt: null
        }
        }
        )

        console.log('data--->', data)
        if(!data) {
            const question = await NewsLettersSamples.create({
                newsletter_id: req.body.newsletter_id,
                sample_id: req.body.sample_id,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            sendNewsletterSampleEmails(req.body.sample_id, req.body.newsletter_id)
        } else {
            const info = {
                sample_id: req.body.sample_id,
                updatedAt: new Date().valueOf(),
            }
            console.log('calling---->', info)
            await NewsLettersSamples.update( info, {where: {id: data.id}})
            sendNewsletterSampleEmails(req.body.sample_id, req.body.newsletter_id)

        }
            return apiResponses.successResponseWithData(
                res,
                'Success!',
            );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};



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

const sendNewsletterSampleEmails = async (id, newsLetterId) => {
    try {
        console.log('calling--->')
        let newsLetterSample = await NewsLettersSamples.findOne({where: {
                    sample_id: id,
                    newsletter_id: newsLetterId,
                    deletedAt: null
                }
            }
        )
        console.log('newsLetterSample--->', newsLetterSample)
        if (newsLetterSample) {
            const sample = await Samples.findOne({ where: { id: newsLetterSample.sample_id, deletedAt: null }})
            if(sample) {
                const sampleQuestions = await SampleQuestions.findAll({where: {sampleId: sample.id, deletedAt: null}})
                if(sample) {
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
                    if(sample.genders && sample.genders.length > 0) {
                        sample.genders.length > 0 && sample.genders.forEach(range => {
                            const { gender, fromAge, toAge } = range;
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
                    if (sample.fromRegistrationDate && sample.toRegistrationDate) {
                        whereClause.createdAt = {
                            [Op.between]: [new Date(sample.fromRegistrationDate), new Date(sample.toRegistrationDate)]
                        };
                    }

                    //--Temp
                    let allCities = []
                    if (sample.stateIds && sample.stateIds.length > 0) {
                        const states = sample.stateIds.map((item => item.value))
                        const statesInfo = await Cities.findAll({ where: {stateId: { [Op.in]: states } }, attributes: ['name', 'hindi', 'zipCode'], raw: true })
                        const zipcodes = statesInfo.map(item => item.zipCode);
                        const names = statesInfo.map(item => item.name);
                        const hindiNames = statesInfo.map(item => item.hindi);
                        const stringArray = names.concat(hindiNames);
                        allCities.push(...zipcodes);
                    }

                    // Cities filter
                    if (sample.cityIds && sample.cityIds.length > 0) {
                        const city = sample.cityIds.map((item => item.label))
                        const statesInfo = await Cities.findAll({ where: {name: { [Op.in]: city } }, attributes: ['name', 'hindi', 'zipCode'], raw: true })
                        const zipcodes = statesInfo.map(item => item.zipCode);
                        const names = statesInfo.map(item => item.name);
                        const hindiNames = statesInfo.map(item => item.hindi);
                        const stringArray = names.concat(hindiNames);
                        allCities.push(...zipcodes);

                    }

                    //Segments
                    if(sample.segments && sample.segments.length > 0) {
                        let obj = {}
                        const segments = sample.segments.map((item => item.label))
                        obj.segment = {
                            [Op.in]: segments
                        };
                        const segmentsCities = await Cities.findAll({ where: obj, attributes: ['name', 'hindi', 'zipCode'], raw: true })
                        if(segmentsCities.length > 0) {
                            const zipcodes = segmentsCities.map(item => item.zipCode);
                            const names = segmentsCities.map(item => item.name);
                            const hindiNames = segmentsCities.map(item => item.hindi);
                            const stringArray = names.concat(hindiNames);
                            allCities.push(...zipcodes);
                        }
                    }

                    //Regions
                    if(sample.regions && sample.regions.length > 0) {
                        let obj = {}
                        const regions = sample.regions.map((item => item.label))
                        obj.region = {
                            [Op.in]: regions
                        };
                        const regionsCities = await Cities.findAll({ where: obj, attributes: ['name', 'region', 'zipCode'], raw: true })
                        if(regionsCities.length > 0) {
                            const zipcodes = regionsCities.map(item => item.zipCode);
                            const names = regionsCities.map(item => item.name);
                            const hindiNames = regionsCities.map(item => item.hindi);
                            const stringArray = names.concat(hindiNames);
                            allCities.push(...zipcodes);
                        }
                    }

                    if(allCities.length > 0) {
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

                    BasicProfile.belongsTo(Users, { foreignKey: 'userId' });
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
                        limit: limit
                    });

                    if(sampleQuestions.length > 0) {
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
                        })
                        const filterCommonUsers = (arrA, arrB) => {
                            return arrA.filter(userA => arrB.some(userB => userB.userId === userA.userId));
                        };
                        usersQuery = filterCommonUsers(usersQuestionCriteria, usersQuery);
                    }

                    let users = usersQuery.filter(item => item.user ? item.user.role === 'panelist' : '')

                    if(users.length > 0) {
                        const emailTemplate = await NewsLetters.findOne({
                            where: {
                                id: newsLetterId,
                                deletedAt: null
                            }
                        })

                        console.log('users.length--->', users.length)
                        //New one----
                        if (emailTemplate) {
                            let totalUsers = users.length;
                            const batchSize = Math.min(totalUsers, users.length); // Define maximum batch size

                            const batchedUsers = [];
                            for (let i = 0; i < totalUsers; i += batchSize) {
                                batchedUsers.push(users.slice(i, i + batchSize));
                            }

                            const processBatch = async (batch) => {
                                const emailsArray = [];

                                // Process each user in the batch
                                for (let i = 0; i < batch.length; i++) {
                                    const user = batch[i];

                                    // Send email to user
                                    emailsArray.push(newsLetterMail(emailTemplate.body, user.user.email, emailTemplate.subject));
                                }

                                // Execute bulk operations
                                await Promise.all([
                                    ...emailsArray,
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
