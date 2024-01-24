const db = require('../models');
const axios = require('axios');
const RedemptionRequests = db.redemptionRequest;
const Users = db.user;
const BasicProfile = db.basicProfile;
const Surveys = db.surveys;
const Rewards = db.rewards;
const RedemptionRequestTransactions = db.redemptionRequestTransactions;
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
        RedemptionRequests.belongsTo(BasicProfile, { foreignKey: 'userId' });
        const data = await RedemptionRequests.findAll({
            where: { deletedAt: null },
            include: [
                {
                    model: Users,
                    required: false,
                    attributes: ['email', "phoneNumber"]
                },
                {
                    model: BasicProfile,
                    required: false,
                    attributes: ['lastName', "firstName"]
                }
            ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        const transformedRedemptionData = data.map(item => ({
            id: item.id,
            userId: item.userId,
            redemptionModeId: item.redemptionModeId,
            redemptionModeTitle: item.redemptionModeTitle,
            requestDate: item.requestDate,
            pointsRequested: item.pointsRequested,
            pointsRedeemed: item.pointsRedeemed,
            redemptionRequestStatus: item.redemptionRequestStatus,
            notes: item.notes,
            redemptionDate: item.redemptionDate,
            cancellationDate: item.cancellationDate,
            IndiaPollsNotes: item.IndiaPollsNotes,
            approvedById: item.approvedById,
            cancelledById: item.cancelledById,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            deletedAt: item.deletedAt,
            fullName: `${item.basic_profile.firstName} ${item.basic_profile.lastName}`,
            user: {
                email: item.user.email,
                phoneNumber: item.user.phoneNumber
            }
        }))
        return apiResponses.successResponseWithData(res, 'success!', transformedRedemptionData);
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



module.exports.ApproveRequest = async (req, res) => {
    try {
        const requestData = await RedemptionRequests.findOne({ where: { id: req.body.id, "redemptionRequestStatus": 'New' }, raw: true })
        console.log('requestData--->', requestData)
        if(requestData) {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://egv-sandbox.flipkart.net/gcms/api/1.0/transaction',
                headers: {
                    'medium': 'inline',
                    'format': 'JSON',
                    'Flipkart-Gifting-Client-Id': 'vis8897905',
                    'Flipkart-Gifting-Client-Token': 'L1hmA1nglATLxAgdztOH'
                }
            };

            axios.request(config)
                .then(async (response) => {
                    console.log('MIDDLE---->' + JSON.stringify(response.data));
                    const user = await Users.findOne({where: {id: requestData.userId}})
                    if (response) {
                        if (response.data.statusCode === 'SUCCESS') {
                            let data = JSON.stringify({
                                "transactionId": response.data.transactionId,
                                "denomination": 1 || requestData.pointsRequested,
                                "recipient": {
                                    "medium": "EMAIL",
                                    "format": "HTML",
                                    "email": user.email,
                                    "imageURL": "https://test.indiapolls.com/assets/img/logo-black.png"
                                }
                            });

                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://egv-sandbox.flipkart.net/gcms/api/1.0/egv/v2?Flipkart-Gifting-Client-Id=vis8897905&Flipkart-Gifting-Client-Token=L1hmA1nglATLxAgdztOH',
                                headers: {
                                    'Flipkart-Gifting-Client-Id': 'vis8897905',
                                    'Flipkart-Gifting-Client-Token': 'L1hmA1nglATLxAgdztOH',
                                    'Content-Type': 'application/json'
                                },
                                data: data
                            };

                            axios.request(config)
                                .then(async (response) => {
                                    console.log('FINAL------>' + JSON.stringify(response.data));
                                    if(response) {
                                        if (response.data.statusCode === 'CREATION_SUCCESSFUL') {
                                            const RedemptionRequest = await RedemptionRequestTransactions.create({
                                                requestId: req.body.id,
                                                status: response.data.statusCode,
                                                response: response.data,
                                                createdAt: new Date().valueOf(),
                                                updatedAt: new Date().valueOf(),
                                            })

                                            const user = await RedemptionRequests.update({
                                                redemptionRequestStatus: 'Redeemed',
                                                redemptionDate: new Date().valueOf(),
                                                pointsRedeemed: requestData.pointsRequested,
                                                userId: requestData.userId,
                                                approvedById: req.body.approvedById,
                                                createdAt: new Date().valueOf(),
                                                updatedAt: new Date().valueOf(),
                                                requestDate: new Date().valueOf()
                                                },
                                                { where: { id: req.body.id } }
                                            )
                                            return apiResponses.successResponseWithData(
                                                res,
                                                'Success!',
                                                response.data
                                            );
                                        } else {
                                            const RedemptionRequest = await RedemptionRequestTransactions.create({
                                                requestId: req.body.requestId,
                                                status: response.data.statusCode,
                                                response: response.data,
                                                createdAt: new Date().valueOf(),
                                                updatedAt: new Date().valueOf(),
                                            })

                                            const user = await RedemptionRequests.update({
                                                    redemptionRequestStatus: 'Failed',
                                                    approvedById: req.body.approvedById,
                                                    createdAt: new Date().valueOf(),
                                                    updatedAt: new Date().valueOf(),
                                                    requestDate: new Date().valueOf()
                                                },
                                                { where: { id: req.body.id } }
                                            )
                                            return apiResponses.successResponseWithData(
                                                res,
                                                'Success!',
                                                null
                                            );
                                        }
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                    return apiResponses.errorResponse(
                                        res,
                                        'Something went wrong!'
                                    );
                                });
                        } else {
                            return apiResponses.errorResponse(
                                res,
                                'Something went wrong!'
                            );
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                    return apiResponses.errorResponse(
                        res,
                        'Something went wrong!'
                    );
                });
        } else {
            return apiResponses.validationErrorWithData(
                res,
                'Redemption request not found!',
                null
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.RejectRequest = async (req, res) => {
    try {
        const requestData = await RedemptionRequests.findOne({ where: { id: req.body.id, "redemptionRequestStatus": 'New' }, raw: true })
        if(requestData) {
            const response = await RedemptionRequests.update({
                    redemptionRequestStatus: 'Rejected',
                    cancellationDate: new Date().valueOf(),
                    userId: requestData.userId,
                    cancelledById: req.body.approvedById,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                    requestDate: new Date().valueOf()
                },
                { where: { id: req.body.id } }
            )
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                response
            );
        }  else {
            return apiResponses.validationErrorWithData(
                res,
                'Redemption request not found!',
                null
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
