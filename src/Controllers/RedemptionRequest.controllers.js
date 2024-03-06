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
                return apiResponses.validationErrorWithData(res, 'अनुरोधित अंक आपके कुल बचे अंकों के बराबर या उससे कम होने चाहिए.');
            } else {
                return apiResponses.validationErrorWithData(res, 'Requested points should be equal or less than your total left points.');
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
                        'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MDkyODUwNzcxNDQsImV4cGlyZXNBdCI6MTcxMDU4MTA3NzE0NCwidG9rZW5fdHlwZSI6IlVTRVIifSwiYV90IjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVJVTkVTQzFGVXlJc0ltdHBaQ0k2SW1WdVl5SXNJbVZ3YXlJNmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbGhLUXpJNGExVmxNeTFZTWtaSlZEVjFWR2MxZEV3MmNrUXljMVp1YkVKa2RrNDBYMjVpZFhaaGJGRWlMQ0o1SWpvaVNWZDNhMHd6Y2pab2NVTk5TMXBDVDI1MFJUVmlaVVZCTWtwTGFVbHpSRFJpT0RBNVkxRlhlVXRqY3lKOWZRLi5UekR5dEdlSlFTa2NMVW5DSlFCXzBRLk1tUWozRldXa2RONV9nOWdCaEtoa2JEeUZfN0NSMUsxVDFpRDhiRlVFcHVTaGpMSHZHdHo2dmRQd2U2aEFzMmU0SU5lRmdic3kzRkZJWEJXU0tSdGNuVDJ1U0hEeHdmY21WRnBOLV9uTGJ0XzhIQ01zbkJVZm50N2x6cmMzaUJ3NUJEdENXREFwb3NFU1FmSXRMYlFoQkpodm1nRUdPNGp2NlhlcWRfNUhwQ3VRWUI4Q1NDRTZnU3JHaE5ybGp4S193NkRlZGdOWlA3dTR6TXZobEFoY0NNQlRPWDY5UTFHUl9leXBfb3E3RW1fZndxZUM0cldFbUtKVDEzUEc4TjNqX2xwemhId0xCblk4cjljMko0S2ZkWU54VVV1bkJpZS1wc0g0YXEzYThoelhIV3NBMi15bFBGQmc3cUhHMmNkcGNVLVNyUlB0R0c2ZEt0a0lmaWtHb2tNVWIxTGozU2x3WjNZN0dLTFF3SjgzUE5sRW43VjlXQ0JmMnd2dWlRaUY1X0RDbmVvemI5ek5acWM5OG5Sc2lzeUhiRFN1SVBIN1Y1NjNqVzlOY3JhNlFjWXhSdjJldGs2WTFjdk9NZlI0QkZCWjZ3dk8xdzFBVkphM2o1SGN2QUFGRl9KZVNtYTdLY0Z6aEs1Z1lmcWpyak9qRHV4eGRLeFhkUDR0bDdFb3dsS0lVXzFVZ3h3QWMwTXRzWG9IUjd2bFRMcFFSR19WQlpCY0RpaFR6czVmaFUxQjNTUDdrVWptbHJjQ3hFeHVJMlhkTWtPNnJHYnJwYXNIUmpxVko1ekRLQjFCdmlqVG9ZX0lCV3VrdWhqdWttSlNlenRYbWNsd1k1ZEZDdHhibXpGYi1UVkR3dEFJMzV5LU83elY3c1hIWTAwS19xZXZoX2lpc2RfRF9hakxOVHdtMWZuVFI5di1jNXNNeEk3TGVUYWc0UlU4TGJJME02b0RjN2tOeVdobUZsdkh4U3AtNGdWVnFjUlp6TEpzbWFKc2pVc1piNDZVWUFiekczdlpBcTIwTkRfaWpUa1MxTkxLWDF0UmhWZ1ZWeHJXSnBRQzQwX0d6ME1zUEY0LVoyb1NqV09kdEtWUUwwdkxRV2xxTWtIQXJZV3ZDRjJKUzFJZVNzaVpCZmgycEZBcGg2QXVMbFVidDJ4S0U0LjVMTTRZWUhYWnRtQi1rRmJTc1d5RVEifQ==',
                       // 'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MDY2MDQ3NDg3NzgsImV4cGlyZXNBdCI6IjIwMjQtMDItMTRUMDg6NTI6MjguNzc4WiIsInRva2VuX3R5cGUiOiJVU0VSIn0sImFfdCI6ImV5SmxibU1pT2lKQk1USTRRMEpETFVoVE1qVTJJaXdpWVd4bklqb2lSVU5FU0MxRlV5SXNJbXRwWkNJNkltVnVZeUlzSW1Wd2F5STZleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5KU1psZFZjak00WkdkNmJVeE9SMFZ1TjBsamNIVnpVSGN6YXpadFVIbEpNQzFuYlV0dmNGOVhabWNpTENKNUlqb2lNMjB5TVdsUlltMTJjMVJhUjFSYVdqSXpTVVV0WWxCMlkwUjJPR1J1TWtwVVMyOVpaWHBxUkdsV2F5SjlmUS4uNU53WW9VWkE3cTBFWl9lYlg4a0k5Zy43ZEh2VXNZaGlJLVQxSDZOendoTENrZzlFZzBmY3dkMFpsUS1FZW5lQklkMmNOYlVpT0hmckUwXzk2SkV0dWh6V2pGM1VzRVJYR1k3MFNycUIwQTkybkZtVWFMZzhtaVlxa1VKR1dYUUpLS2xTdkR5REc1RERPeFlmbDBVTGZHYVdBSjBKNU5wcEZFNmlTYUkwb3VSZ21HeFNyV0Z6Y0czTjRQRkhleDdLWEd5M3VZY2FsLWd3d3VMbkIxbkFKOGtTT0NrdVQ3YUZKanVKMUV3clBmMFJXWEg5cXd1SXJxTGU0UlM4MmlXYi1scE1xaGMwSlRPeFd6UTFtU19mREYyUGpzcW94UHVjRmZ5c1VTUTgwWWFQUDRETDFkUHVSLXdPSzNmOWJKRk5rZHF1bkZTNFozcGJCOWtFSHV2YVBUSW5HVE01NUlzSFpTbWJOUlZOWW9CemY4R3ZySDNhQVVKYi14R3htOGN4aUpTSVdpYmFSLXNHbjJxWXczQ3htMURpN21SWjNIMXZnOWNXaWZZMUtQR19mYUh4Z0U0WE5iTWtZVDJuU0JHU3RzVFR2cGhOYVE0RG50QVJicGg0d2FvZjdWMFBYZXpUaXozWUZ6R1kxMjVidE9mSjVMa1JpS2NjQ3JqNjR3eGs5VE9mNm9YRmRaQVZLNHVORTREemwzU01jZ0xrbkhRUDlhUTljaXQ5dnRPVEtTbTZLajVsbXIwa2R0QUNRTDZJR2dBUS1LamJnLUlxamVLM1ctbWN4UnRmcHlCeGhCX0gtOWVZMUZ5anEwblhGcW9EVEI1NHo3UXp6UW4yQzg3Zmc1LTVwcjdGNXpWVUsxUmcwN3VjUG00QXJuZHd2ZngzdUNiLUNQSWR1ODdGLTlsQjJZTzhyVDV0NTZkd1IwempjSWF4X1NRYzZsVnhYS0sxMF9YcE1jXzBBNUxzU1FHc0ZBUHRRVnlnaFpxZGZOMEp3TEFscDNLMW5yWmhwSVZHYmxoSG83aTNGaVR3d294cTZ6Tlh6cmhSRXljek5CZmU5MXNrbEdPVWNacDJEcUVGeXh1eHVNakNYRElTZDM4bHc0ZExLb2htNFRHMkNLc0wxNFdBY0VJTENnbFRQN1V6b2JtaTNQc3R4VTFEUlJWQlJDLXhjMUlqV202bTNtdEhxSS55bHdOM2p4YV9VT2RCQVVwUlVyY2Z3In0=',
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
                            'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MDgwMTM4OTA5NzksImV4cGlyZXNBdCI6MTcwOTMwOTg5MDk3OSwidG9rZW5fdHlwZSI6IlVTRVIifSwiYV90IjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVJVTkVTQzFGVXlJc0ltdHBaQ0k2SW1WdVl5SXNJbVZ3YXlJNmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJalZJU1VsbVdFcEpUVW8zUlZSUlEwWkRhMlUzUldNNGNVczNNMDgxVEVkTVJFSkJPSEo1YVZFM2FsRWlMQ0o1SWpvaVJtdGFTMlZ1TlVZNVJ6bG1lVFJxWmpseFdIVkxTR2cwUTAxcmVWbFFZMlZpUjBvMVZrTlliVTVXZHlKOWZRLi5pWXlJUVRuYnh5Vk05U04wVVJiS05BLmladFNKcVFtMy1NNzZZRERyQ2IyZ29sajg2WkZZZ0VObjd1SFdqeHV3enlacEc4RGZJM2pQUkZ1bjVlQ3A4eUdaWDlETFJDOXprcUJVTk5RVkpoOW5MVVNyRGFTc3plWXBwTHRrTV80d3MwQkdkTlFrUHlzNldtakM0RDl1VExORHN1dXE4S1lTbUkxZVM4ckYxdDljUlNMS0ozTzU5M1pDamVPbm1fYVdoZmNaUTNGaW1ieXVhNmxPekE1TTRhU296cndFOXBKMkY5eDJ0MHZHbmZyT3l1VkRsSGJVcFdRWllyREZhZVZWSHRlVURZbVFjcVdQam5pa3F1akYyYURmdkhRWjVnT0JMYlR5LUVSZ21mNFhISWRiQjhpekp4Rjl0OXRPV0M1d1VPMzlyRTVYZ2hwWi1lUE14WTVON3IzVTF4Z29OTWNrSHprdHYxTFAwdF95eWFadGQ1R2pqUjlPRTI3aVNQWnNOR2pVdHNVdUxWTl92SEp4WGgwTC1XVWEtaklVU2NXZmNwRVk3V1pOQWVDR29rUGFwSVBrZUdGOGRYaW8zbmZNZm5XbV84VnBZOXNTQVpjWV9ZMHJGbkIyS2RxN3p5YmdpYWNBclRyOF9IbmpkejVzYlVXX0RWNVQtdWFPRXVrMUFta1J6S0VLU2tLY2JwVWs3QWFhYWY1TVdpcEExMVFlYk1GcnVUWmhpVVNJMmRDYUh5dERXRldiMzZ6U0ZzTDdWeFRUTVJCMTdRNnZxa01MV0N4RDlwTGNGYjcyUE9kU1hTR1J4aUFnT1AzUG1KUGVYeGlLeE96Q2RPaU9pcUJiNnp5ZkVJVTVzSUtmaDlmNXJXbVZoTTVYOTJlbmVZV1N3VjFPZndNODhwY3pVYThEbzNEeHJ6Z29VS3ZwRnhtOU5Wajl4U3pEXzU4b3RfYUpIR1A5a1V3aWZTTkJzZVY5SS1sLTJLSzZiajU1MG1MX3plQ3FhdzI4Ukx5eTUtYXR5YnE0VVAySl9ZNjJUWHBqRGxFcVdSelRjMEtfVzFKczBoNGlCcnFGdDVFMUpNZ2RBaTJIcnltY2Qyc1VOaFpDWHpGQ3VnSTVOVUd5Qmh6Zk5PQzBiQWkteTViTTRQRDFfY25BODhqX01aNXcwV0hlY1ZrSkNOREpxRE9QUndtaVY0LnJ1OUlRa3FSb3ZVQ3Vaak1hX2hTa2cifQ==',
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
