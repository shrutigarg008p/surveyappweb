const db = require('../models');
const Options = db.options;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Options.findOne({ where: { text: req.body.text, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Question = await Options.create({
                questionId: req.body.questionId,
                value: req.body.value,
                hint: req.body.hint,
                displayOrder: req.body.displayOrder,
                isActive: req.body.isActive,
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
            questionId: req.body.questionId,
            value: req.body.value,
            hint: req.body.hint,
            displayOrder: req.body.displayOrder,
            isActive: req.body.isActive,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Options.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Options.update(
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
        const data = await Options.findAll({ deletedAt: null, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Options.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Options.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.getAllMA = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await Options.findAll({ where: { hint: "MA" }, attributes: ['id']})
        const idsArray = data.map(option => option.id);
        return apiResponses.successResponseWithData(res, 'success!', idsArray);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
