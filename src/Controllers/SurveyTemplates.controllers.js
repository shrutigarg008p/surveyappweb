const db = require('../models');
const SurveyTemplates = db.surveyTemplates;
const apiResponses = require('../Components/apiresponse');

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

