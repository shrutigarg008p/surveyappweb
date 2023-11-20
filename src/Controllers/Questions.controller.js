const db = require('../models');
const Questions = db.questions;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Questions.findOne({ where: { text: req.body.text, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Question = await Questions.create({
                text: req.body.text,
                profileId: req.body.profileId,
                displayOrder: req.body.displayOrder,
                hint: req.body.hint,
                displayType: req.body.displayType,
                isActive: req.body.isActive,
                dataType: req.body.dataType,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Question
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
            text: req.body.text,
            profileId: req.body.profileId,
            displayOrder: req.body.displayOrder,
            hint: req.body.hint,
            displayType: req.body.displayType,
            isActive: req.body.isActive,
            dataType: req.body.dataType,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Questions.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Questions.update(
                obj, { where: { id: req.params.id } }
            )
            return apiResponses.successResponseWithData(res, 'Success Update', user);

        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await Questions.findAll({ deletedAt: null, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Questions.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Questions.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
