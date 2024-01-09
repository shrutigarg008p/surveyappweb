const db = require('../models');
const Surveys = db.surveys;
const SurveysPartners = db.surveyPartners;
const BlacklistedSurveys = db.blacklistedSurveys;
const SurveyTemplates = db.surveyTemplates;
const SurveyAssigned = db.asssignSurveys;
const Samples = db.sample;
const Rewards = db.rewards;
const BasicProfile = db.basicProfile;
const Users = db.user;
const SurveyEmailSchedules = db.surveyEmailSchedule;
const apiResponses = require('../Components/apiresponse');
const {DataTypes, Op} = require("sequelize");


function calculateBirthDate(age) {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
}

module.exports.create = async (req, res) => {
    try {
        const isExist = await Surveys.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Survey = await Surveys.create({
                name: req.body.name,
                company: req.body.company,
                description: req.body.description,
                isActive: req.body.isActive,
                url: req.body.url,
                ceggPoints: req.body.ceggPoints,
                publishDate: req.body.publishDate,
                expiryDate: req.body.expiryDate,
                userLimitCutoff: req.body.userLimitCutoff,
                userLimitCommitted: req.body.userLimitCommitted,
                surveyType: req.body.surveyType,
                pointAllocationType: req.body.pointAllocationType,
                client: req.body.client,
                surveyLength: req.body.surveyLength,
                surveyUrlIdentifier: req.body.surveyUrlIdentifier,
                companyLogo: req.body.companyLogo,
                outlierCutoffTime: req.body.outlierCutoffTime,
                costPerInterview: req.body.costPerInterview,
                minimumInterviewDuration: req.body.minimumInterviewDuration,
                useUniqueLinks: req.body.useUniqueLinks,
                ipUnique: req.body.ipUnique,
                isPaused: req.body.isPaused,
                disclaimer: req.body.disclaimer,
                description_one: req.body.description_one,
                description_two: req.body.description_two,
                description_three: req.body.description_three,
                description_four: req.body.description_four,
                country: req.body.country,
                colorcode: req.body.colorcode,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })

            if(req.body.blacklistSurvey.length > 0 && Survey) {
                await BlacklistedSurveys.create({
                    surveyId: Survey.id,
                    blacklistSurveyId: req.body.blacklistSurvey[0],
                    survey_id: Survey.id
                })
            }
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Survey
            );
        } else {
            return apiResponses.validationErrorWithData(
                res,
                'Name is already exist!',
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.update = async (req, res) => {
    try {
        let obj = {
            name: req.body.name,
            company: req.body.company,
            description: req.body.description,
            isActive: req.body.isActive,
            url: req.body.url,
            ceggPoints: req.body.ceggPoints,
            publishDate: req.body.publishDate,
            expiryDate: req.body.expiryDate,
            userLimitCutoff: req.body.userLimitCutoff,
            userLimitCommitted: req.body.userLimitCommitted,
            surveyType: req.body.surveyType,
            pointAllocationType: req.body.pointAllocationType,
            surveyUrlIdentifier: req.body.surveyUrlIdentifier,
            client: req.body.client,
            surveyLength: req.body.surveyLength,
            companyLogo: req.body.companyLogo,
            outlierCutoffTime: req.body.outlierCutoffTime,
            costPerInterview: req.body.costPerInterview,
            minimumInterviewDuration: req.body.minimumInterviewDuration,
            useUniqueLinks: req.body.useUniqueLinks,
            ipUnique: req.body.ipUnique,
            isPaused: req.body.isPaused,
            disclaimer: req.body.disclaimer,
            description_one: req.body.description_one,
            description_two: req.body.description_two,
            description_three: req.body.description_three,
            description_four: req.body.description_four,
            country: req.body.country,
            colorcode: req.body.colorcode,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Surveys.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Surveys.update(
                obj, {where: {id: req.params.id}}
            )
            if (req.body.blacklistSurvey.length > 0) {
                const isAvailable = await BlacklistedSurveys.findOne({ where: { surveyId: req.params.id } })
                if(isAvailable) {
                    await BlacklistedSurveys.update({blacklistSurveyId: req.body.blacklistSurvey[0]}, {where: {surveyId: req.params.id}})
                } else {
                    await BlacklistedSurveys.create({
                        surveyId: req.params.id,
                        blacklistSurveyId: req.body.blacklistSurvey[0],
                        survey_id: req.params.id
                    })
                }
            }
            return apiResponses.successResponseWithData(res, 'Success Update', user);
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await Surveys.findAll({ where: { deletedAt: null }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        Surveys.hasMany(BlacklistedSurveys, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveysPartners, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveyTemplates, { foreignKey: 'surveyId' });
        let user = []
        let assignUsers =[]
        const data = await Surveys.findOne({where: {id: req.params.id, deletedAt: null},
            include: [
                {
                    model: BlacklistedSurveys,
                },
                {
                    model: SurveysPartners,
                },
                {
                    model: SurveyTemplates,
                }
            ],
        })
            return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOneDetails = async (req, res) => {
    try {
        Surveys.hasMany(BlacklistedSurveys, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveysPartners, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveyTemplates, { foreignKey: 'surveyId' });
        let user = []
        let assignUsers =[]
        const data = await Surveys.findOne({where: {id: req.params.id, deletedAt: null},
            include: [
                {
                    model: BlacklistedSurveys,
                },
                {
                    model: SurveysPartners,
                },
                {
                    model: SurveyTemplates,
                }
            ],
        })
        const scheduleEmail = await SurveyEmailSchedules.findOne({where: {
                surveyId: data.id,
                deletedAt: null,
            }})
        if(scheduleEmail) {
            const sample = await Samples.findOne({where: {id: scheduleEmail.sampleId, deletedAt: null}})
            if (sample) {
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
                    const states = sample.stateIds.map((item => item.label))
                    whereClause.state = {
                        [Op.in]: states
                    };
                }

                // Cities filter
                if (sample.cityIds && sample.cityIds.length > 0) {
                    const city = sample.cityIds.map((item => item.label))
                    whereClause.city = {
                        [Op.in]: city
                    };
                }

                BasicProfile.belongsTo(Users, {foreignKey: 'userId'});
                console.log('whereClause--->', whereClause)
                const usersQuery = await BasicProfile.findAll({
                    where: whereClause,
                    include: [
                        {
                            model: Users,
                            required: false,
                            attributes: ['email', 'role']
                        },
                    ],
                });
                user = usersQuery.filter(item => item.user ? item.user.role === 'panelist' : '')
                assignUsers = await SurveyAssigned.findAll({where: {surveyId: data.id}})

            }
        }
        return apiResponses.successResponseWithData(res, 'success!', { data, user, assignUsers });
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Surveys.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.AddPartners = async (req, res) => {
    try {
        let surveyId = null
        if(req.body.partners) {
            const newArray = req.body.partners.map(item => {
                surveyId = item.surveyId
                return {
                    ...item,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                };
            });
            await SurveysPartners.destroy({where: {surveyId: surveyId}})
            console.log('newArray--->', newArray)
            const Option = await SurveysPartners.bulkCreate(newArray)
        }
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        console.log('error--->', err)
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.GetUserAllAssignedSurvey = async (req, res) => {
    try {
        SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
        const surveysList = await SurveyAssigned.findAll({
            where: {
                userId: req.params.userId
            },
                include: [
                    {
                        model: Surveys,
                        required: false,
                        attributes: ['name', 'description', 'ceggPoints', 'expiryDate']
                    },
                ],
                limit: 100000,
            order: [['createdAt', 'DESC']]
        })
        return apiResponses.successResponseWithData(res, 'Success', surveysList);
    } catch (err) {
        console.log('erro-->', err)
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.GetUserOneAssignedSurvey = async (req, res) => {
    try {
        SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
        const surveysDetails = await SurveyAssigned.findOne({
            where: {
                id: req.params.id},
                include: [
                    {
                        model: Surveys,
                        required: false,
                        attributes: ['name', 'description', 'ceggPoints', 'expiryDate']
                    },
                ]
        })
        return apiResponses.successResponseWithData(res, 'Success', surveysDetails);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.GetUserOneAssignedSurveyCallback = async (req, res) => {
    try {
        SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
        await SurveyAssigned.update({
            status: req.body.status,
            partnerid: req.body.partnerId,
            updatedAt:  new Date().valueOf() },
            {
            where: {
                temporarySurveyLinkId: req.body.surveyId,
                userId: req.body.userId
            }
        })
        const surveysDetails = await SurveyAssigned.findOne({
            where: {
                temporarySurveyLinkId: req.body.surveyId,
                userId: req.body.userId
            },
            attributes: ['id', 'updatedAt', 'surveyId'],
            include: [
                {
                    model: Surveys,
                    required: false,
                    attributes: ['name', 'description', 'ceggPoints', 'expiryDate', 'createdAt', 'disclaimer']
                }
            ]
        })
        const user = await BasicProfile.findOne({
            where: { userId: req.body.userId },
            attributes: ['firstName', 'lastName']})

        if(req.body.status === 'Completed' && surveysDetails && surveysDetails.survey) {
            const Reward = await Rewards.create({
                points: surveysDetails.survey.ceggPoints,
                rewardType: 'Survey',
                surveyId: surveysDetails.surveyId,
                rewardStatus: 'Pending',
                userId: req.body.userId,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
                rewardDate: new Date().valueOf(),
            })
        }
        return apiResponses.successResponseWithData(res, 'Success', { surveysDetails,user });
    } catch (err) {
        console.log('err-r-->', err)
        return apiResponses.errorResponse(res, err);
    }
};
