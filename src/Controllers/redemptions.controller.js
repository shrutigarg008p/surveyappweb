const db = require('../models');
const RedemptionMode = db.redemptionMode;
const apiResponses = require('../Components/apiresponse');

module.exports.createRedemptionMode = async (req, res) => {
    try {
        const redemptionMode = await RedemptionMode.create({
            name: req.body.name,
            description: req.body.description,
            minimumPoints: req.body.minimumPoints,
            useName: req.body.useName,
            usePhone: req.body.usePhone,
            createdAt: new Date().valueOf(),
            updatedAt: new Date().valueOf(),
            useAddress: req.body.useAddress,
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            redemptionMode
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.updateRedemptionMode = async (req, res) => {
    try {
        let obj = {
            name: req.body.name,
            description: req.body.description,
            minimumPoints: req.body.minimumPoints,
            useName: req.body.useName,
            usePhone: req.body.usePhone,
            updatedAt: new Date().valueOf(),
            useAddress: req.body.useAddress,
        }

        const isExist = await RedemptionMode.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await RedemptionMode.update(
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
        const data = await RedemptionMode.findAll({
            where: { deletedAt: null },
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await RedemptionMode.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.deleteRedemption = async (req, res) => {
    try {
        await RedemptionMode.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
