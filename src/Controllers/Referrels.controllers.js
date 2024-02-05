const db = require('../models');
const Referrals = db.referrals;
const Users = db.user;
const BasicProfile = db.basicProfile;
const apiResponses = require('../Components/apiresponse');
const {DataTypes} = require("sequelize");
const {referralMail, referralMailHindi} = require("../Config/Mails");

module.exports.createReferrals = async (req, res) => {
    try {
        const isExisting = await Referrals.findOne({ where: { userId: req.body.userId, email: req.body.email } })
        if(!isExisting) {
            const user = await BasicProfile.findOne({where: {userId: req.body.userId}})
            if (user) {
                let subject = `${user.firstName} ${user.lastName} has invited you to join IndiaPolls`
                await referralMail(req.body.email, req.body.userId, subject, req.body.name, `${user.firstName} ${user.lastName}`)
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
            } else {
                return apiResponses.validationErrorWithData(res, 'User not exist', null)
            }
        } else {
            return apiResponses.validationErrorWithData(res, 'You have already send invite to this email', null)
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

// referralMail('indiapolls@yopmail.com', '98797898', 'Mohit has invited you', 'Jitendra Singh', "Mohit")


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
        Referrals.belongsTo(Users, {foreignKey: 'userId'});
        const limit = req.params.limit;
        const data = await Referrals.findAll({
            where: { deletedAt: null },
            include: [{
                model: Users,
                required: false,
            }],
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAllUserReferrals = async (req, res) => {
    try {
        const limit = req.params.limit;
        const userId = req.params.userId;
        const data = await Referrals.findAll({
            where: { deletedAt: null, userId: userId },
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


module.exports.bulkCreateReferrals = async (req, res) => {
    try {
        const language = req.headers['language'] || req.query.language || 'en';
        if (req.body.users.length > 0) {
            const userIds = req.body.users.map(user => user.userId);
            const existingReferrals = await Referrals.findAll({
                where: {
                    userId: userIds,
                    email: req.body.users.map(user => user.email),
                },
                attributes: ['userId', 'email'],
            });

            const existingReferralMap = existingReferrals.reduce((map, existingReferral) => {
                const key = `${existingReferral.userId}-${existingReferral.email}`;
                map[key] = true;
                return map;
            }, {});

            const referralsToCreate = req.body.users.filter(user => {
                const key = `${user.userId}-${user.email}`;
                return !existingReferralMap[key];
            });

            if (referralsToCreate.length > 0) {
                const userInfos = await BasicProfile.findAll({
                    where: {
                        userId: userIds,
                    },
                    attributes: ['userId', 'firstName', 'lastName', 'imagePath'],
                    raw: true, //To Remove Default data with proper json
                });

                const bulkReferrals = referralsToCreate.map(user => {
                    const userInfo = userInfos.find(info => info.userId === user.userId);
                    const subject = `${userInfo.firstName} ${userInfo.lastName} has invited you to join IndiaPolls`;
                    if(language === 'hi'){
                        referralMailHindi(user.email, user.userId, subject, user.name, `${userInfo.firstName} ${userInfo.lastName}`);
                    } else {
                        referralMail(user.email, user.userId, subject, user.name, `${userInfo.firstName} ${userInfo.lastName}`);
                    }
                    return {
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        referralStatus: user.referralStatus,
                        referralMethod: user.referralMethod,
                        userId: user.userId,
                        createdAt: new Date().valueOf(),
                        updatedAt: new Date().valueOf(),
                        rewardDate: new Date().valueOf(),
                    };
                });

                await Referrals.bulkCreate(bulkReferrals);
            }
        }
        return apiResponses.successResponseWithData(
            res,
            'Success!',
        );
    } catch (err) {
        console.log('error--->', err)
        return apiResponses.errorResponse(res, err);
    }
};

