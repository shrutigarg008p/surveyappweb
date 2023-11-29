const db = require('../models');
const SecDb = db.sec;
const SecQuestions = db.secQuestions;
const Questions = db.questions;
const Options = db.options;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await SecDb.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Country = await SecDb.create({
                name: req.body.name,
                description: req.body.description,
                isActive: req.body.isActive,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Country
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
            description: req.body.description,
            isActive: req.body.isActive,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await SecDb.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await SecDb.update(
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
        const data = await SecDb.findAll({ deletedAt: null, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await SecDb.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await SecDb.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.createQuestion = async (req, res) => {
    try {
        const isExist = await SecQuestions.findOne({ where: { questionId: req.body.questionId, socioeconomicclassificationid: req.body.socioeconomicclassificationid, deletedAt: null }})
        if(!isExist) {
            const Country = await SecQuestions.create({
                questionId: req.body.questionId,
                socioeconomicclassificationid: req.body.socioeconomicclassificationid,
                operand: req.body.operand,
                optionIds: req.body.optionIds,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Country
            );
        } else {
            return apiResponses.validationErrorWithData(
                res,
                'Question is already exist!',
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};



module.exports.getSecQuestion = async (req, res) => {
    try {
        SecQuestions.belongsTo(Questions, { foreignKey: 'questionId' });
        SecQuestions.belongsTo(Options, { foreignKey: 'optionIds' });
        SecQuestions.belongsTo(SecDb, { foreignKey: 'socioeconomicclassificationid' });
        const data = await SecQuestions.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Questions,
                },
                {
                    model: Options,
                },
                {
                    model: SecDb,
                },
            ],
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            data
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.getSecQuestions = async (req, res) => {
    try {
        SecQuestions.belongsTo(Questions, { foreignKey: 'questionId' });
        SecQuestions.belongsTo(Options, { foreignKey: 'optionIds' });
        const data = await SecQuestions.findAll({
            where: { socioeconomicclassificationid: req.params.secId },
            include: [
                {
                    model: Questions,
                    required: false,
                },
                {
                    model: Options,
                    required: false,
                },
            ],
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            data
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.removeQuestion = async (req, res) => {
    try {
        const isExist = await SecQuestions.destroy({ where: { id: req.params.id }})
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                isExist
            );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


