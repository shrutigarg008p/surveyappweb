const db = require('../models');
const Referrals = db.referrals;
const apiResponses = require('../Components/apiresponse');
const {DataTypes} = require("sequelize");

module.exports.createReferrals = async (req, res) => {
    try {
        const Referral = await Referrals.create({
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            referralStatus: req.body.referralStatus,
            referralMethod: req.body.referralMethod,
            userId: req.body.userId,
            createdAt: new Date().valueOf(),
            updatedAt: new Date().valueOf(),
            rewardDate: new Date().valueOf(),
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            Referral
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.updateReferrals = async (req, res) => {
    try {
        let obj = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            referralStatus: req.body.referralStatus,
            referralMethod: req.body.referralMethod,
            userId: req.body.userId,
            updatedAt: new Date().valueOf(),
            rewardDate: new Date().valueOf(),
        }

        const isExist = await Referrals.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Referrals mode not exist');
        } else {
            const user = await Referrals.update(
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
        const data = await Referrals.findAll({
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
        const data = await Referrals.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.deleteReferrals = async (req, res) => {
    try {
        await Referrals.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
