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

        const allowPoints = {
            'Croma': [10000, 9999, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500, 4000, 3500, 3000, 2500, 2000, 1500, 1000, 500],
            "Google Play Gift Code": [50000, 30000, 10000, 5000],
            "PhonePe eGift voucher": [10000, 5000, 4000, 3000, 2000, 1500, 1000, 700, 500, 400, 200, 100],
            "Flipkart INR": [10000, 9000, 8000, 7500, 7000, 6000, 5700, 5000, 4000, 3500, 1700, 1650, 1600, 1100, 1000, 950, 750, 700, 600, 500, 400, 350, 325, 300, 259, 250, 200, 125, 100, 75, 25],
            "AJIO E-Gift Card": [5000, 3000, 2000, 1000, 750, 500, 100],
        };

        function isPointAllowed(redemptionType, point) {
            const points = allowPoints[redemptionType];
            if (!points) {
                return false;
            }
            return points.includes(point);
        }

        if (!isPointAllowed(req.body.redemptionModeTitle, req.body.pointsRequested) && req.body.redemptionModeTitle !== "Amazon e-Gift Card") {
            console.log("Points are not allowed for redemption type:", req.body.redemptionModeTitle);
            return apiResponses.validationErrorWithData(
                res,
                `Points are not allowed for redemption type: ${req.body.redemptionModeTitle}, allowed points is only ${allowPoints[req.body.redemptionModeTitle]}`
            );
        }

        const totalLeftPoints = await getRedemptionSummary(req.body.userId)
        console.log('BODY-------->', req.body, '========>', totalLeftPoints.totalLeft)
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
                    return apiResponses.validationErrorWithData(res, 'Minimum 100 i-Points are needed to begin redemption, requested points should be in multiples of 50 (Starting from 100, 150, 200, 250, 300, 350, 400, 450, 500, ...9500 Maximum).');
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
                const allowedPoints = {
                    'Croma': [10000, 9999, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500, 4000, 3500, 3000, 2500, 2000, 1500, 1000, 500],
                    "Google Play Gift Code": [50000, 30000, 10000, 5000],
                    "PhonePe eGift voucher": [10000, 5000, 4000, 3000, 2000, 1500, 1000, 700, 500, 400, 200, 100],
                    "Flipkart INR": [10000, 9000, 8000, 7500, 7000, 6000, 5700, 5000, 4000, 3500, 1700, 1650, 1600, 1100, 1000, 950, 750, 700, 600, 500, 400, 350, 325, 300, 259, 250, 200, 125, 100, 75, 25],
                    "AJIO E-Gift Card": [5000, 3000, 2000, 1000, 750, 500, 100]
                };

                function isPointAllowed(redemptionType, point) {
                    const points = allowedPoints[redemptionType];
                    if (!points) {
                        return false; // Redemption type not found
                    }
                    return points.includes(point);
                }

                if (!isPointAllowed(requestData.redemptionModeTitle, requestData.pointsRequested)) {
                    console.log("Points are not allowed for redemption type:", requestData.redemptionModeTitle);
                    return apiResponses.validationErrorWithData(
                        res,
                        `Points are not allowed for redemption type: ${requestData.redemptionModeTitle}`
                    );
                }

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
                        'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MTQzNjgzMTc1ODEsImV4cGlyZXNBdCI6MTcxNTY2NDMxNzU4MSwidG9rZW5fdHlwZSI6IlVTRVIifSwiYV90IjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVJVTkVTQzFGVXlJc0ltdHBaQ0k2SW1WdVl5SXNJbVZ3YXlJNmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJa3gxT0dwUmFVaHBkRGxPUjI0eVJYWm9hMnhwWlV4M1FXeHNjblUwTjFFMWFqbFBOSFZqTVhoNU9EZ2lMQ0o1SWpvaWJWbDZlVmxvTVZwV2VYcHNXVGhFWmxKaVFsOU5hMk53Y1VWTlVISkZOV2d6ZWw5S1NtWkJibEJqWXlKOWZRLi5kYkw5Q21JSndqOGt5NUw2bHZ4eDRBLmI3cWlteW1rajAzSkJ0b2hrS3pPNE4xZXdIOXF1TUJYcXRoQjF0RmtZUk1Pa055d1RSN253ZUdxZVNLRjFfTW5TeF9OTnM3bXUxd0NFbC1KQjJzcTVtNnEyQkxTSHg3WlNwdGFXZG9hZnlUVHhQcndCUWxjdVFNbWNSSFp2QnNKampVYmwxWi1RaFhYQkFfTzlDZ1RvYVpTSUl3cFFIdkFqLUdXUEk0ZUpObWo2YXRUcDZpeDFtRXBMVnQtNlNuRkhhUzlaX0JOemZYRzI2RGhoU3FQc2U2OTVuVzdwWFdQUGhORU83WkMzaUJHUndGc1FCT2Y1Y1VKNzZEYklJS3VOLTRxOVp5YXZKNjZYYVRvWTdrV2cxNkxIMDYtLWN4TTlieXF1VEg5ZXRtTWZXSENzM19FNmVXSFpkLTZBWk1EN2ZMcDFtakF6dTdHVnkwc0Z6SnJDWUVOeDFrTmlfWUtSYVJXdDA0Wm1qWWZ6MEJBWjgyRUxPdE9hR3pfeklFeWY1QmlGSEJDOWFNRWg0Nkw2NC1sYUNkYVBOeHNWSGtFQ1NkTllIUXRxSkczNVhYSmdHLVhLbUZfUmlHUkR1T3UwVzdyUENycV83LW1ad0d1RFdYT25TS1NIZzhZOVM5bUFxYXlBellPenY1cTBxRWRSUHBveXJrWlZMSHhySnNoWE5vanpnZlNKNnVXdFQyTXBlVVVwT01nUmswTHNjU01WSmJHSnpfRFQyZDhpSUtaUHFiX0JxcDYzc2NmOUF3emdiWlB0ejlYZWZFdE5VSktvZUNhTmh5dnR3NFh3WGVlSVJuLS1LQmlORURxaFMtNThzOXRoZGpTNU12ZXhxRU1vVGpLTDl0cjFZa1BIeWZOQjZmNGJPdFpqRTdXNWt6ZnpUYm9WZkhIQkhsLTV3algzR3NQY1ZjNlkzUVBSU2dfTks4UGMyRkY1Y0pDR2I1azJjb3VfcXo3V1ljMWc3R3BudGs3Q1JGeHk1ZC1kdy05NVR1bDd2TlhoYmtFNjdnNXptc190TFhudlRjS1B3VWs0S1QyS25vX0NNQ1B0VWtQd2JBUk5VMWNmTUIwQWNhSFNOUnloUDBzTlU1SGFfcUZKTHEtTEZKV0lHaUY3WUphTXdxcDNoc3hNZDl3OThOSGpRc2trNlJ6TU1nLjRTZk9pZlg5Mm1uYlFMU1F0Tm9adWcifQ==',
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
                    const allowedPoints = {
                        'Croma': [10000, 9999, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500, 4000, 3500, 3000, 2500, 2000, 1500, 1000, 500],
                        "Google Play Gift Code": [50000, 30000, 10000, 5000],
                        "PhonePe eGift voucher": [10000, 5000, 4000, 3000, 2000, 1500, 1000, 700, 500, 400, 200, 100],
                        "Flipkart INR": [10000, 9000, 8000, 7500, 7000, 6000, 5700, 5000, 4000, 3500, 1700, 1650, 1600, 1100, 1000, 950, 750, 700, 600, 500, 400, 350, 325, 300, 259, 250, 200, 125, 100, 75, 25],
                        "AJIO E-Gift Card": [5000, 3000, 2000, 1000, 750, 500, 100]
                    };

                    function isPointAllowed(redemptionType, point) {
                        const points = allowedPoints[redemptionType];
                        if (!points) {
                            return false;
                        }
                        return points.includes(point);
                    }

                    if (isPointAllowed(requestData.redemptionModeTitle, requestData.pointsRequested)) {
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
                                    "poNumber": requestData.id + i,
                                    "notifyReceiverEmail": 1
                                }
                            }
                        });

                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://accounts.xoxoday.com/chef/v1/oauth/api',
                            headers: {
                                'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MTQzNjgzMTc1ODEsImV4cGlyZXNBdCI6MTcxNTY2NDMxNzU4MSwidG9rZW5fdHlwZSI6IlVTRVIifSwiYV90IjoiZXlKbGJtTWlPaUpCTVRJNFEwSkRMVWhUTWpVMklpd2lZV3huSWpvaVJVTkVTQzFGVXlJc0ltdHBaQ0k2SW1WdVl5SXNJbVZ3YXlJNmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJa3gxT0dwUmFVaHBkRGxPUjI0eVJYWm9hMnhwWlV4M1FXeHNjblUwTjFFMWFqbFBOSFZqTVhoNU9EZ2lMQ0o1SWpvaWJWbDZlVmxvTVZwV2VYcHNXVGhFWmxKaVFsOU5hMk53Y1VWTlVISkZOV2d6ZWw5S1NtWkJibEJqWXlKOWZRLi5kYkw5Q21JSndqOGt5NUw2bHZ4eDRBLmI3cWlteW1rajAzSkJ0b2hrS3pPNE4xZXdIOXF1TUJYcXRoQjF0RmtZUk1Pa055d1RSN253ZUdxZVNLRjFfTW5TeF9OTnM3bXUxd0NFbC1KQjJzcTVtNnEyQkxTSHg3WlNwdGFXZG9hZnlUVHhQcndCUWxjdVFNbWNSSFp2QnNKampVYmwxWi1RaFhYQkFfTzlDZ1RvYVpTSUl3cFFIdkFqLUdXUEk0ZUpObWo2YXRUcDZpeDFtRXBMVnQtNlNuRkhhUzlaX0JOemZYRzI2RGhoU3FQc2U2OTVuVzdwWFdQUGhORU83WkMzaUJHUndGc1FCT2Y1Y1VKNzZEYklJS3VOLTRxOVp5YXZKNjZYYVRvWTdrV2cxNkxIMDYtLWN4TTlieXF1VEg5ZXRtTWZXSENzM19FNmVXSFpkLTZBWk1EN2ZMcDFtakF6dTdHVnkwc0Z6SnJDWUVOeDFrTmlfWUtSYVJXdDA0Wm1qWWZ6MEJBWjgyRUxPdE9hR3pfeklFeWY1QmlGSEJDOWFNRWg0Nkw2NC1sYUNkYVBOeHNWSGtFQ1NkTllIUXRxSkczNVhYSmdHLVhLbUZfUmlHUkR1T3UwVzdyUENycV83LW1ad0d1RFdYT25TS1NIZzhZOVM5bUFxYXlBellPenY1cTBxRWRSUHBveXJrWlZMSHhySnNoWE5vanpnZlNKNnVXdFQyTXBlVVVwT01nUmswTHNjU01WSmJHSnpfRFQyZDhpSUtaUHFiX0JxcDYzc2NmOUF3emdiWlB0ejlYZWZFdE5VSktvZUNhTmh5dnR3NFh3WGVlSVJuLS1LQmlORURxaFMtNThzOXRoZGpTNU12ZXhxRU1vVGpLTDl0cjFZa1BIeWZOQjZmNGJPdFpqRTdXNWt6ZnpUYm9WZkhIQkhsLTV3algzR3NQY1ZjNlkzUVBSU2dfTks4UGMyRkY1Y0pDR2I1azJjb3VfcXo3V1ljMWc3R3BudGs3Q1JGeHk1ZC1kdy05NVR1bDd2TlhoYmtFNjdnNXptc190TFhudlRjS1B3VWs0S1QyS25vX0NNQ1B0VWtQd2JBUk5VMWNmTUIwQWNhSFNOUnloUDBzTlU1SGFfcUZKTHEtTEZKV0lHaUY3WUphTXdxcDNoc3hNZDl3OThOSGpRc2trNlJ6TU1nLjRTZk9pZlg5Mm1uYlFMU1F0Tm9adWcifQ==',
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
            }
            return apiResponses.successResponseWithData(res, 'Successfully uploaded');
        } else {
            return apiResponses.validationErrorWithData(res, 'Sheet should not be empty', null);
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
