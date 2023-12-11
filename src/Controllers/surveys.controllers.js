const db = require('../models');
const Surveys = db.surveys;
const SurveysPartners = db.surveyPartners;
const BlacklistedSurveys = db.blacklistedSurveys;
const SurveyTemplates = db.surveyTemplates;

const apiResponses = require('../Components/apiresponse');
const {DataTypes} = require("sequelize");

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
            client: req.body.client,
            surveyLength: req.body.surveyLength,
            companyLogo: req.body.companyLogo,
            outlierCutoffTime: req.body.outlierCutoffTime,
            costPerInterview: req.body.costPerInterview,
            minimumInterviewDuration: req.body.minimumInterviewDuration,
            useUniqueLinks: req.body.useUniqueLinks,
            ipUnique: req.body.ipUnique,
            isPaused: req.body.isPaused,
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
        const newArray = req.body.partners.map(item => {
            return {
                ...item,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            };
        });
        console.log('newArray--->', newArray)
        const Option = await SurveysPartners.bulkCreate(newArray)
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
