const db = require('../models');
const SurveyEmailSchedule = db.surveyEmailSchedule;
const apiResponses = require('../Components/apiresponse');
const {triggerSurveyEmail} = require("../utils/ScheduleEmails");


module.exports.create = async (req, res) => {
    try {
        // const isExist = await SurveyEmailSchedule.findOne({ where: { surveyId: req.body.surveyId, surveyTemplateId: req.body.surveyTemplateId, deletedAt: null, scheduleStatus: 'Pending' }})
        // console.log(isExist)
        // if(!isExist) {
            const Survey = await SurveyEmailSchedule.create({
                surveyId: req.body.surveyId,
                surveyTemplateId: req.body.surveyTemplateId,
                sampleId: req.body.sampleId,
                count: req.body.count,
                isSendAll: req.body.isSendAll,
                scheduleDate: new Date(req.body.scheduleDate).toISOString(),
                scheduleType: req.body.scheduleType,
                scheduleStatus: req.body.scheduleStatus,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Survey
            );
        // } else {
        //     return apiResponses.validationErrorWithData(
        //         res,
        //         'Already scheduled!',
        //     );
        // }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.update = async (req, res) => {
    try {
        let obj = {
            surveyId: req.body.surveyId,
            surveyTemplateId: req.body.surveyTemplateId,
            sampleId: req.body.sampleId,
            count: req.body.count,
            isSendAll: req.body.isSendAll,
            scheduleDate: req.body.scheduleDate,
            scheduleType: req.body.scheduleType,
            scheduleStatus: req.body.scheduleStatus,
            updatedAt: new Date().valueOf(),
        }
        const user = await SurveyEmailSchedule.update( obj, { where: { id: req.params.id }})
        return apiResponses.successResponseWithData(res, 'Success Update', user);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await SurveyEmailSchedule.findAll({ where: { surveyId: req.params.surveyId, deletedAt: null }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await SurveyEmailSchedule.findOne({ where: { id: req.params.id, deletedAt: null },
        })
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await SurveyEmailSchedule.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.sendNow = async (req, res) => {
    try {
        if(req.params.id) {
            await triggerSurveyEmail(req.params.id)
            return apiResponses.successResponseWithData(res, 'Success');
        } else {
            return apiResponses.validationErrorWithData(res, 'Validation error: Id must be specified')
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
