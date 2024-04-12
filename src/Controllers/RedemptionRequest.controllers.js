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
const { manualRedemptionRequest, manualRedemptionRequestHindi, manualApproveEmail, manualApproveEmailHindi} = require("../Config/Mails");
const { getRedemptionSummary } = require("../utils/RespondentSummary");

module.exports.createRedemptionRequest = async (req, res) => {
    try {
        const language = req.headers['language'] || req.body.language || 'en';
        const allowedPoints = [100];
        for (let i = 100; i <= 9500; i += 50) {
            allowedPoints.push(i);
        }
        const totalLeftPoints = await getRedemptionSummary(req.body.userId)
        if(totalLeftPoints.totalLeft >= 100 && req.body.pointsRequested <= totalLeftPoints.totalLeft) {
            if (allowedPoints.includes(req.body.pointsRequested) && req.body.pointsRequested % 50 === 0) {
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
                const Basic = await BasicProfile.findOne({where: {userId: req.body.userId}})
                const user = await Users.findOne({where: {id: req.body.userId}})
                if (req.body.redemptionModeTitle === 'Amazon e-Gift Card') {
                    if (language === 'hi') {
                        manualRedemptionRequestHindi(`${Basic.firstName} ${Basic.lastName}`, user.email)
                    } else {
                        manualRedemptionRequest(`${Basic.firstName} ${Basic.lastName}`, user.email)
                    }

                }
                return apiResponses.successResponseWithData(
                    res,
                    'Success!',
                    RedemptionRequest
                );
            } else {
                if (language === 'hi') {
                    return apiResponses.validationErrorWithData(res, 'रिडेम्पशन शुरू करने के लिए न्यूनतम 100 i-पॉइंट्स की आवश्यकता होती है, अनुरोधित पॉइंट्स 50 के गुणकों में होने चाहिए (जैसे-100, 150, 200, 250, 300, 350, 400, 450, 500, ... 9500 अधिकतम)');
                } else {
                    return apiResponses.validationErrorWithData(res, 'Minimum 100 i-Points are needed to begin redemption, requested points should be in multiples of 50 (Starting from 100, 150, 200, 250, 300, 350, 400, 450, 500, ...9500 Maximum)');
                }
            }
        } else {
            if (language === 'hi') {
                return apiResponses.validationErrorWithData(res, 'रिडेम्पशन शुरू करने के लिए न्यूनतम 100 i-पॉइंट्स की आवश्यकता होती है, अनुरोधित पॉइंट्स 50 के गुणकों में होने चाहिए (जैसे-100, 150, 200, 250, 300, 350, 400, 450, 500, ... 9500 अधिकतम)');
            } else {
                return apiResponses.validationErrorWithData(res, 'Minimum 100 i-Points are needed to begin redemption, requested points should be in multiples of 50 (Starting from 100, 150, 200, 250, 300, 350, 400, 450, 500, ...9500 Maximum)');
            }
        }
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
        RedemptionRequests.hasOne(RedemptionRequestTransactions, { foreignKey: 'requestId' });
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
                },
                {
                    model: RedemptionRequestTransactions,
                    required: false,
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
            redemptionrequesttransaction: item.redemptionrequesttransaction,
            notes: item.notes,
            coupon: item.coupon,
            pin: item.pin,
            validity: item.validity,
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
                email: item.user?.email,
                phoneNumber: item.user?.phoneNumber
            }
        }))
        return apiResponses.successResponseWithData(res, 'success!', transformedRedemptionData);
    } catch (err) {
        console.log('error---->', err)
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAllByUserId = async (req, res) => {
    try {
        const limit = req.params.limit;
        RedemptionRequests.belongsTo(Users, { foreignKey: 'userId' });
        RedemptionRequests.hasOne(RedemptionRequestTransactions, { foreignKey: 'requestId' });
        const data = await RedemptionRequests.findAll({
            where: { userId: req.params.userId, deletedAt: null },
            include: [
                {
                    model: Users,
                    required: false,
                    attributes: ['email', "phoneNumber"]
                },
                {
                    model: RedemptionRequestTransactions,
                    required: false,
                    // attributes: ['response']
                }
            ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        const totalCountData = await Rewards.findAll({
            where: { userId: req.params.userId, deletedAt: null, rewardStatus: "Accepted" },
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
        const totalLeft = totalEarned - totalRedeemed - totalPendingRedeemed


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
            if (requestData.redemptionModeTitle === 'Amazon Vouchers Not Available Temporary') {
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
                                        "imageURL": "https://panel.indiapolls.com/assets/img/logo-black.png"
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
                                        if (response) {
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
                                                    {where: {id: req.body.id}}
                                                )
                                                return apiResponses.successResponseWithData(
                                                    res,
                                                    'Success!',
                                                    response.data
                                                );
                                            } else {
                                                const RedemptionRequest = await RedemptionRequestTransactions.create({
                                                    requestId: req.body.id,
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
                                                    {where: {id: req.body.id}}
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
                let productId = ''
                if(requestData.redemptionModeTitle === 'PhonePe eGift voucher') {
                    productId = 49609
                }

                if(requestData.redemptionModeTitle === 'Google Play Gift Code') {
                    productId = 48801
                }

                if(requestData.redemptionModeTitle === 'Croma') {
                    productId = 14383
                }

                if(requestData.redemptionModeTitle === 'Flipkart INR') {
                    productId = 1007
                }

                if(requestData.redemptionModeTitle === 'AJIO E-Gift Card') {
                    productId = 56170
                }

                const user = await Users.findOne({where: {id: requestData.userId}})
                let data = JSON.stringify({
                    "query": "plumProAPI.mutation.placeOrder",
                    "tag": "plumProAPI",
                    "variables": {
                        "data": {
                            "productId": productId,
                            "quantity": "1",
                            "denomination": requestData.pointsRequested,
                            "email": user.email,
                            "contact": `+91-${user.phoneNumber}`,
                            "tag": "",
                            "poNumber": requestData.id,
                            "notifyReceiverEmail": 1
                        }
                    }
                });

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    // url: 'https://stagingaccount.xoxoday.com/chef/v1/oauth/api',
                    url: 'https://accounts.xoxoday.com/chef/v1/oauth/api',
                    headers: {
                        'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MTI5MjQ1NTYxMzAsImV4cGlyZXNBdCI6MTcxNDIyMDU1NjEzMCwidG9rZW5fdHlwZSI6IlVTRVIifSwiYV90IjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVJVTkVTQzFGVXlJc0ltdHBaQ0k2SW1WdVl5SXNJbVZ3YXlJNmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJalpWY2xOeFdrTlBOMHN5ZVVoYVZVUjZjVzlCUzE5RlNUSkhXRVk1VW5jemJURk1hM0Z1UmtsNmNHY2lMQ0o1SWpvaVJqWXhUVk0yYTBOTmRrdHhhMHRNWWw5U2RtOWhWemRIVldJeFJrdEdXVmR2TlhORFNVZGtObkZhY3lKOWZRLi5iMFFPbTNpemFOaEU3aGlkNWVtX3BRLnRuZHJWRmY2WGtkNnRyQ0EyeWFTaXU5WTFhRmV3YmpuTmdEODRIYUkzcmtmY2dlZjd4eWtsV0NKRlItNjNlOWFYcWt5cnpTV3BPWlY0Y0N2ZUN6cUZDZTlYQUtmSFRKcGFDUUhDLTNrejBkZ2M2MDdfVEZxOGd3NXBlN1lZdm91aEp3VWVHd1A5Snl1ZklFS2Q3Tm85QXJmZU5pc0h2b21nUWdqOUluSDcwQmctb1ZsZlFmYUg1eTFzaUlkdWotWDhMZGVaTHZUbEZJWVdMelBPRlgxaW84SW9jUnNVcmlnSFBKT3RKSzVscEczbVpBY3RsdEJGM2ZwZ0dZOElMTjl0VHlGQm9Pbmh4MVRkNlpHX2o1aklWQnRXejRrcXNqM2tMQkhWNk11MlNlTGNMOEllb3BHYXJ3Q3hoVzNpYUxvcDBHRGtFOHIwUk1UUFZTclhaMXEwWUNDdnZaTEdNLXRpTl9pb2RPNXVZcUlDSHZGZC1MaVJhMHVlb0JsSW0teDcxcERSNWZlc253WWlwRF9lR3VkNzBpYTV6d2w4NHM5d3RuWVRMOGYzdkJUUHk2RTBKcW5aUG4yRWlWM2xvUkxGcVhsM21xTTYtblNpMUtfNWFKSkF0MEx5U2lMV25FYk1JY1dzUWd3eTA0bGd3TmVQeHRhNVFBb1E5eEFrSWI0d3hZT1oxU1hhMUpOSmk5aGFhMndUUUd4a1hTOFlfeWZFZTdVQ21rUDBSRmtUa2lVTFdPcnBTMUlZUV9TRXQtZGMyUUg2NThaRy1fODltdVRPNkVvcmx1SXdxeFpRaGY3eTAtcXBrdW1vNFQ3WlJRN3Rwa2JHbUM0b1hFRERqX2Y0TE1tUXgzX05sOUhvaGluNEtydE5mQmxrb043SnVvWWVjVWl3RWFrd1Z4UVF5bmdEWGlDVnRTZUZRcHJYM25BdzRvWHhBMUJuRDQtbFN2cm1JVkpsck9XZHNUVG41bzNmalVFZUZ4M1lRQnFmRHY4ZjBfWnh6alZFVmtVVTFXTzRLbWZqSllJUC05b3l1dl93cmx6SU5XOHFFLWFFLW45SDVaWWlfbUY1d0xfMGRldXJzSTdDN21rQl9uckh1Q0VXT280cEdfNkZZMGgzaTdPRmNnbFozYjFNSEo0OXd6Sy10bXJyY09YbGhnLm1pRzY2OFFoRWh2ZEVrcmNVcUppR0EifQ==',
                        'Content-Type': 'application/json',
                        'Cookie': '__cf_bm=HUVN4tkMTW8KtIHKqzFTz3fROutLhihBCbEdox5iC8g-1706087320-1-AZ2QBFOh5IbAmku1wdIbWaWkJnAbRNpN6CKTwSTlAcy4RZggXunq4Qe8UTAmkPTqdpj1CviE1siSg+lRKNGNaOg=; _cfuvid=fS5l5NEZIWVwugVKZ5qbR.IsipPPJXgrVLSLrBeUdhg-1706084905801-0-604800000'
                    },
                    data : data
                };

                axios.request(config)
                    .then(async (response) => {
                        console.log('FINAL------>' + JSON.stringify(response.data));
                        if (response) {
                            if (response.data.data.placeOrder.status === 1) {
                                const RedemptionRequest = await RedemptionRequestTransactions.create({
                                    requestId: req.body.id,
                                    status: response.data.data.placeOrder.status,
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
                                    {where: {id: req.body.id}}
                                )
                                return apiResponses.successResponseWithData(
                                    res,
                                    'Success!',
                                    response.data
                                );
                            } else {
                                const RedemptionRequest = await RedemptionRequestTransactions.create({
                                    requestId: req.body.id,
                                    status: response.data.data.placeOrder.status,
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
                                    {where: {id: req.body.id}}
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

            }
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


module.exports.manualApprove = async (req, res) => {
    try {
        const language = req.headers['language'] || req.body.language || req.query.language || 'en';
        const requestData = await RedemptionRequests.findOne({ where: { id: req.body.id, "redemptionRequestStatus": 'New' }, raw: true })
        if(requestData) {
            let obj = {
                coupon: req.body.coupon,
                redemptionRequestStatus: 'Redeemed',
                redemptionDate: new Date().valueOf(),
                pointsRedeemed: requestData.pointsRequested,
                userId: requestData.userId,
                approvedById: req.body.approvedById,
                pin: req.body.pin,
                validity: req.body.validity,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
                requestDate: new Date().valueOf()
            }

            const isExist = await RedemptionRequests.findOne({where: {id: req.body.id, deletedAt: null}})
            if (!isExist) {
                return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
            } else {
                const userRequest = await RedemptionRequests.update(
                    obj, {where: {id: req.body.id}}
                )
                const user = await Users.findOne({ where: { id: requestData.userId }})
                if(language === 'hi') {
                    await manualApproveEmailHindi(user.email, req.body.coupon, req.body.pin, req.body.validity)
                } else {
                    await manualApproveEmail(user.email, req.body.coupon, req.body.pin, req.body.validity)
                }
                return apiResponses.successResponseWithData(res, 'Success Update', userRequest);
            }
        } else {
            return apiResponses.validationErrorWithData(res, 'Request not found', null);
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.manualBulkApprove = async (req, res) => {
    try {
        const language = req.headers['language'] || req.body.language || req.query.language || 'en';
        if(req.body.bulkImportData.length > 0) {
            const data = req.body.bulkImportData
            for (let i = 0; i < data.length; i++) {
                const requestData = await RedemptionRequests.findOne({ where: { id: data[i].id, "redemptionRequestStatus": 'New' }, raw: true })
                if(requestData && data[i].coupon) {
                    let obj = {
                        coupon: data[i].coupon,
                        redemptionRequestStatus: 'Redeemed',
                        redemptionDate: new Date().valueOf(),
                        pointsRedeemed: requestData.pointsRequested,
                        userId: requestData.userId,
                        approvedById: data[i].approvedById,
                        pin: data[i].pin,
                        validity: data[i].validity,
                        createdAt: new Date().valueOf(),
                        updatedAt: new Date().valueOf(),
                        requestDate: new Date().valueOf()
                    }

                    const user = await Users.findOne({ where: { id: requestData.userId }})
                    if(language === 'hi') {
                        await manualApproveEmailHindi(user.email, data[i].coupon, data[i].pin, data[i].validity)
                    } else {
                        await manualApproveEmail(user.email, data[i].coupon, data[i].pin, data[i].validity)
                    }
                    const isExist = await RedemptionRequests.findOne({where: {id: data[i].id, deletedAt: null}})
                    if (isExist) {
                        const user = await RedemptionRequests.update(
                            obj, {where: {id: data[i].id}}
                        )
                    }
                }
            }
            return apiResponses.successResponseWithData(res, 'Successfully uploaded');
        } else {
            return apiResponses.validationErrorWithData(res, 'Sheet should not be empty', null);
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.xoxoBulkApprove = async (req, res) => {
    try {
        if(req.body.bulkImportData.length > 0) {
            const data = req.body.bulkImportData
            for (let i = 0; i < data.length; i++) {
                const requestData = await RedemptionRequests.findOne({
                    where: {
                        id: data[i].id,
                        "redemptionRequestStatus": 'New'
                    }, raw: true
                })
                if (requestData && data[i]) {
                    let productId = ''
                    if (requestData.redemptionModeTitle === 'PhonePe eGift voucher') {
                        productId = 49609
                    }

                    if (requestData.redemptionModeTitle === 'Google Play Gift Code') {
                        productId = 48801
                    }

                    if (requestData.redemptionModeTitle === 'Croma') {
                        productId = 14383
                    }

                    if (requestData.redemptionModeTitle === 'Flipkart INR') {
                        productId = 1007
                    }

                    if (requestData.redemptionModeTitle === 'AJIO E-Gift Card') {
                        productId = 56170
                    }

                    const user = await Users.findOne({where: {id: requestData.userId}})
                    let dataInfo = JSON.stringify({
                        "query": "plumProAPI.mutation.placeOrder",
                        "tag": "plumProAPI",
                        "variables": {
                            "data": {
                                "productId": productId,
                                "quantity": "1",
                                "denomination": requestData.pointsRequested,
                                "email": user.email,
                                "contact": `+91-${user.phoneNumber}`,
                                "tag": "",
                                "poNumber": requestData.id+i,
                                "notifyReceiverEmail": 1
                            }
                        }
                    });

                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://accounts.xoxoday.com/chef/v1/oauth/api',
                        headers: {
                            'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MTI5MjQ1NTYxMzAsImV4cGlyZXNBdCI6MTcxNDIyMDU1NjEzMCwidG9rZW5fdHlwZSI6IlVTRVIifSwiYV90IjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVJVTkVTQzFGVXlJc0ltdHBaQ0k2SW1WdVl5SXNJbVZ3YXlJNmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJalpWY2xOeFdrTlBOMHN5ZVVoYVZVUjZjVzlCUzE5RlNUSkhXRVk1VW5jemJURk1hM0Z1UmtsNmNHY2lMQ0o1SWpvaVJqWXhUVk0yYTBOTmRrdHhhMHRNWWw5U2RtOWhWemRIVldJeFJrdEdXVmR2TlhORFNVZGtObkZhY3lKOWZRLi5iMFFPbTNpemFOaEU3aGlkNWVtX3BRLnRuZHJWRmY2WGtkNnRyQ0EyeWFTaXU5WTFhRmV3YmpuTmdEODRIYUkzcmtmY2dlZjd4eWtsV0NKRlItNjNlOWFYcWt5cnpTV3BPWlY0Y0N2ZUN6cUZDZTlYQUtmSFRKcGFDUUhDLTNrejBkZ2M2MDdfVEZxOGd3NXBlN1lZdm91aEp3VWVHd1A5Snl1ZklFS2Q3Tm85QXJmZU5pc0h2b21nUWdqOUluSDcwQmctb1ZsZlFmYUg1eTFzaUlkdWotWDhMZGVaTHZUbEZJWVdMelBPRlgxaW84SW9jUnNVcmlnSFBKT3RKSzVscEczbVpBY3RsdEJGM2ZwZ0dZOElMTjl0VHlGQm9Pbmh4MVRkNlpHX2o1aklWQnRXejRrcXNqM2tMQkhWNk11MlNlTGNMOEllb3BHYXJ3Q3hoVzNpYUxvcDBHRGtFOHIwUk1UUFZTclhaMXEwWUNDdnZaTEdNLXRpTl9pb2RPNXVZcUlDSHZGZC1MaVJhMHVlb0JsSW0teDcxcERSNWZlc253WWlwRF9lR3VkNzBpYTV6d2w4NHM5d3RuWVRMOGYzdkJUUHk2RTBKcW5aUG4yRWlWM2xvUkxGcVhsM21xTTYtblNpMUtfNWFKSkF0MEx5U2lMV25FYk1JY1dzUWd3eTA0bGd3TmVQeHRhNVFBb1E5eEFrSWI0d3hZT1oxU1hhMUpOSmk5aGFhMndUUUd4a1hTOFlfeWZFZTdVQ21rUDBSRmtUa2lVTFdPcnBTMUlZUV9TRXQtZGMyUUg2NThaRy1fODltdVRPNkVvcmx1SXdxeFpRaGY3eTAtcXBrdW1vNFQ3WlJRN3Rwa2JHbUM0b1hFRERqX2Y0TE1tUXgzX05sOUhvaGluNEtydE5mQmxrb043SnVvWWVjVWl3RWFrd1Z4UVF5bmdEWGlDVnRTZUZRcHJYM25BdzRvWHhBMUJuRDQtbFN2cm1JVkpsck9XZHNUVG41bzNmalVFZUZ4M1lRQnFmRHY4ZjBfWnh6alZFVmtVVTFXTzRLbWZqSllJUC05b3l1dl93cmx6SU5XOHFFLWFFLW45SDVaWWlfbUY1d0xfMGRldXJzSTdDN21rQl9uckh1Q0VXT280cEdfNkZZMGgzaTdPRmNnbFozYjFNSEo0OXd6Sy10bXJyY09YbGhnLm1pRzY2OFFoRWh2ZEVrcmNVcUppR0EifQ==',
                            'Content-Type': 'application/json',
                            'Cookie': '__cf_bm=HUVN4tkMTW8KtIHKqzFTz3fROutLhihBCbEdox5iC8g-1706087320-1-AZ2QBFOh5IbAmku1wdIbWaWkJnAbRNpN6CKTwSTlAcy4RZggXunq4Qe8UTAmkPTqdpj1CviE1siSg+lRKNGNaOg=; _cfuvid=fS5l5NEZIWVwugVKZ5qbR.IsipPPJXgrVLSLrBeUdhg-1706084905801-0-604800000'
                        },
                        data: dataInfo
                    };

                    axios.request(config)
                        .then(async (response) => {
                            console.log('FINAL------>' + JSON.stringify(response.data));
                            if (response) {
                                if (response.data.data.placeOrder.status === 1) {
                                    const RedemptionRequest = await RedemptionRequestTransactions.create({
                                        requestId: data[i].id,
                                        status: response.data.data.placeOrder.status,
                                        response: response.data,
                                        createdAt: new Date().valueOf(),
                                        updatedAt: new Date().valueOf(),
                                    })

                                    const user = await RedemptionRequests.update({
                                            redemptionRequestStatus: 'Redeemed',
                                            redemptionDate: new Date().valueOf(),
                                            pointsRedeemed: requestData.pointsRequested,
                                            userId: requestData.userId,
                                            approvedById: data[i].approvedById,
                                            createdAt: new Date().valueOf(),
                                            updatedAt: new Date().valueOf(),
                                            requestDate: new Date().valueOf()
                                        },
                                        {where: {id: data[i].id}}
                                    )
                                } else {
                                    const RedemptionRequest = await RedemptionRequestTransactions.create({
                                        requestId: data[i].id,
                                        status: response.data.data.placeOrder.status,
                                        response: response.data,
                                        createdAt: new Date().valueOf(),
                                        updatedAt: new Date().valueOf(),
                                    })

                                    const user = await RedemptionRequests.update({
                                            redemptionRequestStatus: 'Failed',
                                            approvedById: data[i].approvedById,
                                            createdAt: new Date().valueOf(),
                                            updatedAt: new Date().valueOf(),
                                            requestDate: new Date().valueOf()
                                        },
                                        {where: {id: data[i].id}}
                                    )
                                }
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            return true
                        })
                }
            }
            return apiResponses.successResponseWithData(res, 'Successfully uploaded');
        } else {
            return apiResponses.validationErrorWithData(res, 'Sheet should not be empty', null);
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
