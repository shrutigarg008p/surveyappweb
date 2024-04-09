const db = require('../models');
const SurveyAssigned = db.asssignSurveys;
const Rewards = db.rewards;
const Profiles = db.profiles;
const Surveys = db.surveys;
const Users = db.user;
const Referrals = db.referrals;
const RedemptionRequests = db.redemptionRequest;
const RedemptionRequestTransactions = db.redemptionRequestTransactions;
const ProfileUserResponses = db.profileUserResponse;
const {DataTypes, Op, Sequelize} = require("sequelize");

async function respondentSummary(userId) {
    db.profiles.hasMany(db.questions, {foreignKey: 'profileId'});
    db.questions.belongsTo(db.profiles, {foreignKey: 'profileId'});
    db.profiles.hasMany(ProfileUserResponses, {foreignKey: 'profileId'});
    const totalSurveys = await SurveyAssigned.count({where: {userId: userId}})
    const incompleteSurveys = await SurveyAssigned.count({
        where: {
            userId: userId,
            status: "pending",
            isStarted: true
        }
    })
    const completeSurveys = await SurveyAssigned.count({
        where: {
            userId: userId,
            status: {
                [Op.not]: 'pending'
            },
            isStarted: true
        }
    })
    const notStartedSurveys = await SurveyAssigned.count({
        where: {
            userId: userId,
            status: "pending",
            isStarted: false
        }
    })
    const profilesWithQuestionsCount = await Profiles.findAll({
        attributes: {
            include: [
                [Sequelize.literal('(SELECT COUNT(*) FROM questions WHERE questions."profileId" = profiles.id AND questions."deletedAt" IS NULL AND questions."isActive" = true)'), 'questionCount']
            ]
        },
        include: [
            {
                model: ProfileUserResponses,
                where: {userId: userId},
                attributes: ['id', "response"],
                required: false
            }
        ],
        raw: true
    })
    const result = profilesWithQuestionsCount.map(section => {
        const totalQuestions = parseInt(section.questionCount);
        const response = section['profileuserresponses.response'];
        if (response && Object.keys(response).length > 0) {
            const attemptedQuestions = Object.keys(response).length;
            const remainingQuestions = totalQuestions - attemptedQuestions;
            const attemptedPercentage = Math.round((attemptedQuestions / totalQuestions) * 100);
            delete section['profileuserresponses.response'];
            delete section['profileuserresponses.id'];
            return {
                ...section,
                totalQuestions,
                attemptedQuestions,
                remainingQuestions,
                attemptedPercentage
            };
        } else {
            return {
                ...section,
                totalQuestions,
                attemptedQuestions: 0,
                remainingQuestions: totalQuestions,
                attemptedPercentage: 0
            };
        }
    });
    const overallTotalQuestions = result.reduce((total, section) => total + section.totalQuestions, 0);
    const overallAttemptedQuestions = result.reduce((total, section) => total + section.attemptedQuestions, 0);
    const overallAttemptedPercentage = Math.round((overallAttemptedQuestions / overallTotalQuestions) * 100);
    console.log('looo----->', overallAttemptedPercentage)
    const totalRewardPoints = await Rewards.sum('points', {where: {userId: userId, rewardStatus: "Accepted"}});
    const totalReferralsPoints = await Rewards.sum('points', {
        where: {
            userId: userId,
            rewardStatus: "Accepted",
            rewardType: 'Referral'
        }
    });
    const totalReferralsApproved = await Rewards.sum('points', {
        where: {
            userId: userId,
            rewardStatus: "Accepted",
            rewardType: 'Referral'
        }
    });

    const totalRedeemedData = await RedemptionRequests.findAll({
        where: {userId: userId, deletedAt: null, redemptionRequestStatus: 'Redeemed'},
    });
    const totalPendingData = await RedemptionRequests.findAll({
        where: {userId: userId, deletedAt: null, redemptionRequestStatus: 'New'},
    });

    const totalRedeemed = totalRedeemedData.reduce((sum, reward) => sum + reward.pointsRedeemed, 0);
    const totalPendingRedeemed = totalPendingData.reduce((sum, reward) => sum + reward.pointsRequested, 0);
    const totalLeft = totalRewardPoints - totalRedeemed
    return {
        totalSurveys,
        incompleteSurveys,
        completeSurveys,
        notStartedSurveys,
        overallAttemptedPercentage,
        totalRewardPoints,
        totalReferralsPoints,
        totalReferralsApproved,
        totalLeft
    };
}


async function getRewardsSummary(userId) {
    Rewards.belongsTo(Surveys, { foreignKey: 'surveyId' });
    Rewards.belongsTo(Users, { foreignKey: 'userId' });
    // Rewards.belongsTo(Users, { foreignKey: 'referralId' });
    const data = await Rewards.findAll({
        where: { userId:  userId, deletedAt: null, rewardStatus: "Accepted" },
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
        order: [['createdAt', 'DESC']]
    });

    const totalRedeemedData = await RedemptionRequests.findAll({
        where: { userId:  userId, deletedAt: null, redemptionRequestStatus: 'Redeemed' },
    });

    const totalPendingData = await RedemptionRequests.findAll({
        where: { userId:  userId, deletedAt: null, redemptionRequestStatus: 'New' },
    });

    const totalPendingRedeemed = totalPendingData.reduce((sum, reward) => sum + reward.pointsRequested, 0);

    const totalRedeemed = totalRedeemedData.reduce((sum, reward) => sum + reward.pointsRedeemed, 0);
    const totalProfilePoints = data.reduce((total, item) => {
        if (item.rewardType === 'Profile Completed') {
            return total + item.points;
        }
        return total;
    }, 0);

    const surveyPoints = data.reduce((total, item) => {
        if (item.rewardType === 'Survey') {
            return total + item.points;
        }
        return total;
    }, 0);

    const referralsPoints = data.reduce((total, item) => {
        if (item.rewardType === 'Referral') {
            return total + item.points;
        }
        return total;
    }, 0);

    const totalPoints = data.reduce((sum, reward) => sum + reward.points, 0);
    const leftPoints = totalPoints - totalRedeemed - totalPendingRedeemed
    return {
         totalProfilePoints,
         referralsPoints,
         surveyPoints,
         totalPoints,
         totalRedeemed,
         leftPoints
    }
}


async function getRedemptionSummary(userId) {
    RedemptionRequests.belongsTo(Users, { foreignKey: 'userId' });
    RedemptionRequests.hasOne(RedemptionRequestTransactions, { foreignKey: 'requestId' });
    const data = await RedemptionRequests.findAll({
        where: { userId:  userId, deletedAt: null },
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
        order: [['createdAt', 'DESC']]
    });
    const totalCountData = await Rewards.findAll({
        where: { userId:  userId, deletedAt: null, rewardStatus: "Accepted" },
    });
    const totalRedeemedData = await RedemptionRequests.findAll({
        where: { userId:  userId, deletedAt: null, redemptionRequestStatus: 'Redeemed' },
    });
    const totalPendingData = await RedemptionRequests.findAll({
        where: { userId:  userId, deletedAt: null, redemptionRequestStatus: 'New' },
    });

    const totalEarned = totalCountData.reduce((sum, reward) => sum + reward.points, 0);
    const totalRedeemed = totalRedeemedData.reduce((sum, reward) => sum + reward.pointsRedeemed, 0);
    const totalPendingRedeemed = totalPendingData.reduce((sum, reward) => sum + reward.pointsRequested, 0);
    const totalLeft = totalEarned - totalRedeemed - totalPendingRedeemed

    return {
        totalEarned,
        totalRedeemed,
        totalPendingRedeemed,
        totalLeft
    }
}

async function getReferralSummary(userId) {
    const totalCount = await Referrals.count({
        where: {
            userId: userId,
            deletedAt: null
        }
    });

    const approvedCount = await Referrals.count({
        where: {
            approvedById: {
                [Op.not]: null
            },
            deletedAt: null,
            userId: userId
        }
    });
    return {
        totalCount,
        approvedCount,
    }
}

async function userAssignedSurveys(userId) {
    SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
    return await SurveyAssigned.findAll({
        where: {
            userId: userId
        },
        attributes: ['status', 'createdAt'],
        include: [
            {
                model: Surveys,
                required: false,
                // where: {
                //     closeDate: {[Op.or]: [null]},
                //     expiryDate: {
                //         [Op.gt]: new Date()
                //     }
                // },
                attributes: ['name', 'description', 'surveyLength', 'ceggPoints', "overquota", "terminate", "qualityterminate", 'expiryDate', "description_one", "description_two", "description_three", "description_four", "colorcode"]
            },
        ],
        limit: 100000,
        order: [['createdAt', 'DESC']]
    })
}

module.exports = {
    respondentSummary,
    getRewardsSummary,
    getRedemptionSummary,
    getReferralSummary,
    userAssignedSurveys
}
