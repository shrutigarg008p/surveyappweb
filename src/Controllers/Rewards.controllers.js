const db = require('../models');
const Rewards = db.rewards;
const Users = db.user;
const Surveys = db.surveys;
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

        const totalPoints = data.reduce((sum, reward) => sum + reward.points, 0);
        return apiResponses.successResponseWithData(res, 'success!', {data, totalPoints});
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
