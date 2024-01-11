const db = require('../models');
const SurveyAssigned = db.asssignSurveys;
const Rewards = db.rewards;
const Profiles = db.profiles;
const RedemptionRequests = db.redemptionRequest;
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
                [Sequelize.literal('(SELECT COUNT(*) FROM questions WHERE questions."profileId" = profiles.id)'), 'questionCount']
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

    const totalRewardPoints = await Rewards.sum('points', {where: {userId: userId}});
    const totalReferralsPoints = await Rewards.sum('points', {
        where: {
            userId: userId,
            rewardType: 'Referral'
        }
    });
    const totalReferralsApproved = await Rewards.sum('points', {
        where: {
            userId: userId,
            rewardType: 'Accepted'
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

module.exports = {
    respondentSummary
}
