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
            if (requestData.redemptionModeTitle === 'Amazon Vouchers') {
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
                        // 'Authorization': 'Bearer eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MDYwODQ2MzQ2MTQsImV4cGlyZXNBdCI6IjIwMjQtMDItMDhUMDg6MjM6NTQuNjE0WiIsInRva2VuX3R5cGUiOiJVU0VSIn0sImFfdCI6ImV5SmxibU1pT2lKQk1USTRRMEpETFVoVE1qVTJJaXdpWVd4bklqb2lSVU5FU0MxRlV5SXNJbXRwWkNJNkltVnVZeUlzSW1Wd2F5STZleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SWtScGFuY3dTR3AyUzNkSVUxUXdVbEJYVGpWemJHdFpjSGsyVDAxbVZsRkJSRVJWTjNSM09FcDFTMk1pTENKNUlqb2lRM1V6TWtsblRFSlpiWGRQV1VFdGNHSjZYM1ZGVldadVVtZ3lNa3g1TTNkYVltZG1XazlhVmxvNVVTSjlmUS4uYVFBWUVlZnY3QldSRlgyWnp3dkdGQS5Zd195WkZfdlpkQ3FlemNYaHBmWXVKUGxyeUtjSGNOOFZPOUM0RDJDcGJTenl2eGk2Ri1IZkYyYjUtdHJ6cEY1cjR0aHRHS2xjVzFqMzd3M2x2c2dyaGEzZXNhNU5TTFpYMEtPc2UtdlF0eFNyWlU1dldZY2hwNkQzNnBhSjZETjNsWlg0eUt2bmxzckgtTE84MEl6a3V5MEU0Y2hTelVjU2ZzMUJvNWFZaVFBbWZJZnNqY09yVS1NcmlDRmlZVm9ZYm5mV01nOExhR0pDUnZsVWFWZF80R2dKV1FKaFVjaVZNMHlkMDRoX0dGODRpTWtPbjJsRWRsOFFxUlZ1aUpONlg1ZkZsS00wU2VJcXZrbkJLenFFVjVSR3g2bm9BZzMxamZvdWxkV2pLWFFCRERPQlhqOWcxT0tMQ25iTm03SXA0SUE2VUlBYlo5RlR0ZFNzdno4NjBEbjJ1dkF6c0Roc1ZZYTNmOGxqbEJvcjFBQ0NKcWppV2NyY0lfang5ay12QzNUYzU5R2xpaFQ2WjhjT2h5WXFQTFhOZVFPLU83X3F5RkNLN1pqZlo5Q3BrMFZCSUNzX1VycXc2Y2RRaUt4RUx0QVJvQ2phSE1jc3NCYXc4NzFjRm11NFR2WnFRTGZFQ01OLTdwNGNKOFpFNUhtMnIyNnRGUVR4T1NhQTg1S29hRjQ3eW5xVUlrRWNxLWF5dnR5dXpDdlpSSFlRYkZMYzN2QmJZZ2t0T1JvN19Cc2RMbE91dUpqYkdmY1ZYMnpNWVVhYmJnNGdDd184dVdaMlNUMmd0UHZZN2tyZ3d6VllSSXVYWGdzbklkaUMwMXlSaGtuT09rbkl3U05STXdzUENnd050ankxWWJKcVVLYzhXa1dEdFM2c2VnNDhFU2Vxb05lcUxKM2NXRkJIZ0lJUWRENE9xUDJaUDJ6Ui1abkNwQjFySFJyTnlaMTBkRHNnQ19IdE5QOUwtNDFRVmdpZVQxRDNDZ2Q2NGw3SndISjhOb1NIZmU3WUVJdG5OM2pZUHFQNVFFMHBfWFZ5Z0E2MXpLeUtReWtXTFBuVmRNV3FRSnFKZ0ZXRjVmMk5JMG1Ra3UzdVNySldVaS0xT1l4SER2VG14aHFwSnlYYWlZZmtXRVBDWk9YczY2bHRrdlkzZ25OcWxic0h2OC5WRnhMRGFSMS02RDJFakRINVBwazZRIn0==',
                       'Authorization': 'eyJ0b2tlbkNvbnRlbnQiOnsiaXNzdWVkRm9yIjoidGVzdCIsInNjb3BlIjoiIiwiaXNzdWVkQXQiOjE3MDY2MDQ3NDg3NzgsImV4cGlyZXNBdCI6IjIwMjQtMDItMTRUMDg6NTI6MjguNzc4WiIsInRva2VuX3R5cGUiOiJVU0VSIn0sImFfdCI6ImV5SmxibU1pT2lKQk1USTRRMEpETFVoVE1qVTJJaXdpWVd4bklqb2lSVU5FU0MxRlV5SXNJbXRwWkNJNkltVnVZeUlzSW1Wd2F5STZleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5KU1psZFZjak00WkdkNmJVeE9SMFZ1TjBsamNIVnpVSGN6YXpadFVIbEpNQzFuYlV0dmNGOVhabWNpTENKNUlqb2lNMjB5TVdsUlltMTJjMVJhUjFSYVdqSXpTVVV0WWxCMlkwUjJPR1J1TWtwVVMyOVpaWHBxUkdsV2F5SjlmUS4uNU53WW9VWkE3cTBFWl9lYlg4a0k5Zy43ZEh2VXNZaGlJLVQxSDZOendoTENrZzlFZzBmY3dkMFpsUS1FZW5lQklkMmNOYlVpT0hmckUwXzk2SkV0dWh6V2pGM1VzRVJYR1k3MFNycUIwQTkybkZtVWFMZzhtaVlxa1VKR1dYUUpLS2xTdkR5REc1RERPeFlmbDBVTGZHYVdBSjBKNU5wcEZFNmlTYUkwb3VSZ21HeFNyV0Z6Y0czTjRQRkhleDdLWEd5M3VZY2FsLWd3d3VMbkIxbkFKOGtTT0NrdVQ3YUZKanVKMUV3clBmMFJXWEg5cXd1SXJxTGU0UlM4MmlXYi1scE1xaGMwSlRPeFd6UTFtU19mREYyUGpzcW94UHVjRmZ5c1VTUTgwWWFQUDRETDFkUHVSLXdPSzNmOWJKRk5rZHF1bkZTNFozcGJCOWtFSHV2YVBUSW5HVE01NUlzSFpTbWJOUlZOWW9CemY4R3ZySDNhQVVKYi14R3htOGN4aUpTSVdpYmFSLXNHbjJxWXczQ3htMURpN21SWjNIMXZnOWNXaWZZMUtQR19mYUh4Z0U0WE5iTWtZVDJuU0JHU3RzVFR2cGhOYVE0RG50QVJicGg0d2FvZjdWMFBYZXpUaXozWUZ6R1kxMjVidE9mSjVMa1JpS2NjQ3JqNjR3eGs5VE9mNm9YRmRaQVZLNHVORTREemwzU01jZ0xrbkhRUDlhUTljaXQ5dnRPVEtTbTZLajVsbXIwa2R0QUNRTDZJR2dBUS1LamJnLUlxamVLM1ctbWN4UnRmcHlCeGhCX0gtOWVZMUZ5anEwblhGcW9EVEI1NHo3UXp6UW4yQzg3Zmc1LTVwcjdGNXpWVUsxUmcwN3VjUG00QXJuZHd2ZngzdUNiLUNQSWR1ODdGLTlsQjJZTzhyVDV0NTZkd1IwempjSWF4X1NRYzZsVnhYS0sxMF9YcE1jXzBBNUxzU1FHc0ZBUHRRVnlnaFpxZGZOMEp3TEFscDNLMW5yWmhwSVZHYmxoSG83aTNGaVR3d294cTZ6Tlh6cmhSRXljek5CZmU5MXNrbEdPVWNacDJEcUVGeXh1eHVNakNYRElTZDM4bHc0ZExLb2htNFRHMkNLc0wxNFdBY0VJTENnbFRQN1V6b2JtaTNQc3R4VTFEUlJWQlJDLXhjMUlqV202bTNtdEhxSS55bHdOM2p4YV9VT2RCQVVwUlVyY2Z3In0=',
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
                                    requestId: req.body.requestId,
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
