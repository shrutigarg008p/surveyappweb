const db = require('../models');
const SurveyTemplates = db.surveyTemplates;
const SurveyAssign = db.asssignSurveys;
const Surveys = db.surveys;
const apiResponses = require('../Components/apiresponse');
const {Op} = require("sequelize");

module.exports.create = async (req, res) => {
    try {
        const Survey = await SurveyTemplates.create({
            name: req.body.name,
            subject: req.body.subject,
            surveyId: req.body.surveyId,
            body: req.body.body,
            isActive: req.body.isActive,
            createdAt: new Date().valueOf(),
            updatedAt: new Date().valueOf(),
        })
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
            surveyId: req.body.surveyId,
            body: req.body.body,
            isActive: req.body.isActive,
            updatedAt: new Date().valueOf(),
        }
        const user = await SurveyTemplates.update( obj, {where: {id: req.params.id}})
        return apiResponses.successResponseWithData(res, 'Success Update', user);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await SurveyTemplates.findAll({ where: { surveyId: req.params.id, deletedAt: null }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        let data = await SurveyTemplates.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await SurveyTemplates.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.redirectToSurvey = async (req, res) => {
    try {
        console.log('req.params--->', req.params)

        SurveyAssign.belongsTo(Surveys, { foreignKey: 'surveyId' });
        const assignedSurvey = await SurveyAssign.findOne({
            where: {
                temporarySurveyLinkId: parseInt(req.params.id, 10),
                userId: req.params.userId,
                status: 'pending',
                expiryDate: {
                    [Op.gt]: new Date()
                },
            },
            include: [
                {
                    model: Surveys,
                    required: false,
                    where: {
                        surveyType: 'Open',
                        expiryDate: {
                            [Op.gt]: new Date()
                        }
                    },
                    attributes: ['name', 'description']
                },
            ],
        });

        console.log('assignedSurvey----->', assignedSurvey.survey)
        if(assignedSurvey) {
            if(assignedSurvey.survey) {
                await SurveyAssign.update({
                    isStarted: true,
                    isCompleted: true
                }, {
                    where: {
                        temporarySurveyLinkId: parseInt(req.params.id, 10),
                        userId: req.params.userId,
                        expiryDate: {
                            [Op.gt]: new Date()
                        }
                    }
                })
                return res.redirect(assignedSurvey.originalSurveyLink);
            } else {
                return res.redirect('https://panel.indiapolls.com/#/survey-unavailable-message');
            }
        } else {
            return res.redirect('https://panel.indiapolls.com/#/survey-attempted-message');
        }
    } catch (err) {
        console.log('error--->', err)
        return apiResponses.errorResponse(res, err);
    }
};
