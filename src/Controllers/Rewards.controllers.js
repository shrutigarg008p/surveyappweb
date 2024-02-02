const db = require('../models');
const Rewards = db.rewards;
const Users = db.user;
const Surveys = db.surveys;
const RedemptionRequests = db.redemptionRequest;
const apiResponses = require('../Components/apiresponse');
const {DataTypes} = require("sequelize");
const Sequelize = db.Sequelize;


module.exports.createRewards = async (req, res) => {
    try {
        const Reward = await Rewards.create({
            points: req.body.points,
            rewardType: req.body.rewardType,
            surveyId: req.body.surveyId,
            referralId: req.body.referralId,
            rewardStatus: req.body.rewardStatus,
            userId: req.body.userId,
            createdAt: new Date().valueOf(),
            updatedAt: new Date().valueOf(),
            rewardDate: new Date().valueOf(),
        })

        return apiResponses.successResponseWithData(
            res,
            'Success!',
            Reward
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.updateRewards = async (req, res) => {
    try {
        let obj = {
            points: req.body.points,
            rewardType: req.body.rewardType,
            surveyId: req.body.surveyId,
            referralId: req.body.referralId,
            rewardStatus: req.body.rewardStatus,
            userId: req.body.userId,
            updatedAt: new Date().valueOf(),
            rewardDate: new Date().valueOf(),
        }

        const isExist = await Rewards.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Rewards mode not exist');
        } else {
            const user = await Rewards.update(
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
        const data = await Rewards.findAll({
            where: { deletedAt: null },
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
        const language = req.headers['language'] || req.body.language || 'en';
        Rewards.belongsTo(Surveys, { foreignKey: 'surveyId' });
        Rewards.belongsTo(Users, { foreignKey: 'userId' });
        // Rewards.belongsTo(Users, { foreignKey: 'referralId' });
        const limit = req.params.limit;
        const data = await Rewards.findAll({
            where: { userId: req.params.userId, deletedAt: null },
            include: [
                {
                    model: Surveys,
                    required: false,
                    attributes: ['name', 'description', 'ceggPoints', 'expiryDate', 'createdAt', 'disclaimer']
                },
                {
                    model: Users,
                    required: false,
                    attributes: ['email']
                }
            ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        });

        const totalRedeemedData = await RedemptionRequests.findAll({
            where: { userId: req.params.userId, deletedAt: null, redemptionRequestStatus: 'Redeemed' },
        });
        const totalRedeemed = totalRedeemedData.reduce((sum, reward) => sum + reward.pointsRedeemed, 0);

        const totalPoints = data.reduce((sum, reward) => sum + reward.points, 0);
        const leftPoints = totalPoints - totalRedeemed
        let totalPointsInfo = []
        if (language === 'hi'){
            totalPointsInfo = [
                {
                    name: "कुल अंक",
                    value: totalPoints
                },
                {
                    name: "कुल रीडीम",
                    value: totalRedeemed
                },
                {
                    name: "बचे हुए अंक",
                    value: leftPoints
                }
            ];
        } else {
            totalPointsInfo = [
                {
                    name: "Total Points",
                    value: totalPoints
                },
                {
                    name: "Total Redeemed",
                    value: totalRedeemed
                },
                {
                    name: "Left Points",
                    value: leftPoints
                }
            ];
        }
        return apiResponses.successResponseWithData(res, 'success!', {data, totalPoints, totalRedeemed, leftPoints, totalPointsInfo });
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Rewards.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.deleteRewards = async (req, res) => {
    try {
        await Rewards.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
