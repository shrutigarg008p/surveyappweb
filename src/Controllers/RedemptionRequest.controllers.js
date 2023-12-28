const db = require('../models');
const RedemptionRequests = db.redemptionRequest;
const Users = db.user;
const Surveys = db.surveys;
const Rewards = db.rewards;
const apiResponses = require('../Components/apiresponse');
const {DataTypes} = require("sequelize");

module.exports.createRedemptionRequest = async (req, res) => {
    try {
        const RedemptionRequest = await RedemptionRequests.create({
            redemptionRequestStatus: req.body.redemptionRequestStatus,
            notes: req.body.notes,
            redemptionDate: req.body.redemptionDate,
            pointsRedeemed: req.body.pointsRedeemed,
            pointsRequested: req.body.pointsRequested,
            redemptionModeTitle: req.body.redemptionModeTitle,
            redemptionModeId: req.body.redemptionModeId,
            userId: req.body.userId,
            createdAt: new Date().valueOf(),
            updatedAt: new Date().valueOf(),
            requestDate: new Date().valueOf(),
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            RedemptionRequest
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.updateRedemptionRequest = async (req, res) => {
    try {
        let obj = {
            redemptionRequestStatus: req.body.redemptionRequestStatus,
            notes: req.body.notes,
            redemptionDate: req.body.redemptionDate,
            pointsRedeemed: req.body.pointsRedeemed,
            pointsRequested: req.body.pointsRequested,
            redemptionModeTitle: req.body.redemptionModeTitle,
            redemptionModeId: req.body.redemptionModeId,
            userId: req.body.userId,
            updatedAt: new Date().valueOf(),
            requestDate: new Date().valueOf(),
        }

        const isExist = await RedemptionRequests.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await RedemptionRequests.update(
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
        RedemptionRequests.belongsTo(Users, { foreignKey: 'userId' });
        const data = await RedemptionRequests.findAll({
            where: { deletedAt: null },
            include: [
                {
                    model: Users,
                    required: false,
                    attributes: ['email', "phoneNumber"]
                }
            ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAllByUserId = async (req, res) => {
    try {
        const limit = req.params.limit;
        RedemptionRequests.belongsTo(Users, { foreignKey: 'userId' });
        const data = await RedemptionRequests.findAll({
            where: { userId: req.params.userId, deletedAt: null },
            include: [
                {
                    model: Users,
                    required: false,
                    attributes: ['email', "phoneNumber"]
                }
            ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        const totalCountData = await Rewards.findAll({
            where: { userId: req.params.userId, deletedAt: null },
        });
        const totalRedeemedData = await RedemptionRequests.findAll({
            where: { userId: req.params.userId, deletedAt: null, redemptionRequestStatus: 'Redeemed' },
        });
        const totalPendingData = await RedemptionRequests.findAll({
            where: { userId: req.params.userId, deletedAt: null, redemptionRequestStatus: 'New' },
        });

        const totalEarned = totalCountData.reduce((sum, reward) => sum + reward.points, 0);
        const totalRedeemed = totalRedeemedData.reduce((sum, reward) => sum + reward.pointsRedeemed, 0);
        const totalPendingRedeemed = totalPendingData.reduce((sum, reward) => sum + reward.pointsRequested, 0);
        const totalLeft = totalEarned - totalRedeemed


        return apiResponses.successResponseWithData(res, 'success!', { data, totalEarned, totalRedeemed, totalPendingRedeemed, totalLeft});
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.getOne = async (req, res) => {
    try {
        const data = await RedemptionRequests.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.deleteRedemption = async (req, res) => {
    try {
        await RedemptionRequests.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
