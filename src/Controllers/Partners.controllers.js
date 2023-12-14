const db = require('../models');
const Partners = db.partners;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Partners.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const partner = await Partners.create({
                name: req.body.name,
                description: req.body.description,
                successUrl: req.body.successUrl,
                badTerminatedUrl: req.body.badTerminatedUrl,
                overQuotaUrl: req.body.overQuotaUrl,
                disqualifiedUrl: req.body.disqualifiedUrl,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                partner
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
            successUrl: req.body.successUrl,
            badTerminatedUrl: req.body.badTerminatedUrl,
            overQuotaUrl: req.body.overQuotaUrl,
            disqualifiedUrl: req.body.disqualifiedUrl,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Partners.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Partners.update(
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
        const data = await Partners.findAll({ deletedAt: null, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Partners.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Partners.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
