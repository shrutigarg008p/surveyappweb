const db = require('../models');
const Surveys = db.surveys;
const SurveysPartners = db.surveyPartners;
const BlacklistedSurveys = db.blacklistedSurveys;
const SurveyTemplates = db.surveyTemplates;
const SurveyAssigned = db.asssignSurveys;
const Samples = db.sample;
const Rewards = db.rewards;
const BasicProfile = db.basicProfile;
const RedemptionRequests = db.redemptionRequest;
const Users = db.user;
const Cities = db.city;
const Partners = db.partners;
const Profiles = db.profiles;
const PartnerUsers = db.partnerUsers
const SurveyEmailSchedules = db.surveyEmailSchedule;
const ProfileUserResponses = db.profileUserResponse;
const SamplesQuestions = db.sampleQuestions;
const apiResponses = require('../Components/apiresponse');
const {DataTypes, Op, Sequelize} = require("sequelize");
const {respondentSummary} = require("../utils/RespondentSummary");
const {URL} = require("url");



function calculateBirthDate(age) {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
}

function appendParamsToUrl(baseUrl, userId, surveyId) {
    console.log('baseUrl--->', baseUrl)
    if (baseUrl) {
        const url = new URL(baseUrl);
        url.searchParams.append('userid', userId);
        url.searchParams.append('surveyid', surveyId);
        return url.toString();
    } else {
        console.error('Invalid baseUrl:', baseUrl);
        return true
    }
}


module.exports.create = async (req, res) => {
    try {
        const isExist = await Surveys.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Survey = await Surveys.create({
                name: req.body.name,
                company: req.body.company,
                description: req.body.description,
                isActive: req.body.isActive,
                url: req.body.url,
                ceggPoints: req.body.ceggPoints,
                publishDate: req.body.publishDate,
                expiryDate: req.body.expiryDate,
                userLimitCutoff: req.body.userLimitCutoff,
                userLimitCommitted: req.body.userLimitCommitted,
                surveyType: req.body.surveyType,
                pointAllocationType: req.body.pointAllocationType,
                client: req.body.client,
                surveyLength: req.body.surveyLength,
                surveyUrlIdentifier: req.body.surveyUrlIdentifier,
                companyLogo: req.body.companyLogo,
                outlierCutoffTime: req.body.outlierCutoffTime,
                costPerInterview: req.body.costPerInterview,
                minimumInterviewDuration: req.body.minimumInterviewDuration,
                useUniqueLinks: req.body.useUniqueLinks,
                ipUnique: req.body.ipUnique,
                isPaused: req.body.isPaused,
                disclaimer: req.body.disclaimer,
                description_one: req.body.description_one,
                description_two: req.body.description_two,
                description_three: req.body.description_three,
                description_four: req.body.description_four,
                country: req.body.country,
                colorcode: req.body.colorcode || '#FFA500',
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })

            if(req.body.blacklistSurvey.length > 0 && Survey) {
                await BlacklistedSurveys.create({
                    surveyId: Survey.id,
                    blacklistSurveyId: req.body.blacklistSurvey[0],
                    survey_id: Survey.id
                })
            }
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Survey
            );
        } else {
            return apiResponses.validationErrorWithData(
                res,
                'Name is already exist!',
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.update = async (req, res) => {
    try {
        let obj = {
            name: req.body.name,
            company: req.body.company,
            description: req.body.description,
            isActive: req.body.isActive,
            url: req.body.url,
            ceggPoints: req.body.ceggPoints,
            publishDate: req.body.publishDate,
            expiryDate: req.body.expiryDate,
            userLimitCutoff: req.body.userLimitCutoff,
            userLimitCommitted: req.body.userLimitCommitted,
            surveyType: req.body.surveyType,
            pointAllocationType: req.body.pointAllocationType,
            surveyUrlIdentifier: req.body.surveyUrlIdentifier,
            client: req.body.client,
            surveyLength: req.body.surveyLength,
            companyLogo: req.body.companyLogo,
            outlierCutoffTime: req.body.outlierCutoffTime,
            costPerInterview: req.body.costPerInterview,
            minimumInterviewDuration: req.body.minimumInterviewDuration,
            useUniqueLinks: req.body.useUniqueLinks,
            ipUnique: req.body.ipUnique,
            isPaused: req.body.isPaused,
            disclaimer: req.body.disclaimer,
            description_one: req.body.description_one,
            description_two: req.body.description_two,
            description_three: req.body.description_three,
            description_four: req.body.description_four,
            country: req.body.country,
            colorcode: req.body.colorcode,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Surveys.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Surveys.update(
                obj, {where: {id: req.params.id}}
            )
            if (req.body.blacklistSurvey.length > 0) {
                const isAvailable = await BlacklistedSurveys.findOne({ where: { surveyId: req.params.id } })
                if(isAvailable) {
                    await BlacklistedSurveys.update({blacklistSurveyId: req.body.blacklistSurvey[0]}, {where: {surveyId: req.params.id}})
                } else {
                    await BlacklistedSurveys.create({
                        surveyId: req.params.id,
                        blacklistSurveyId: req.body.blacklistSurvey[0],
                        survey_id: req.params.id
                    })
                }
            }
            return apiResponses.successResponseWithData(res, 'Success Update', user);
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        Surveys.hasMany(SurveyAssigned, { foreignKey: 'surveyId' });
        const data = await Surveys.findAll({
            where: {
                deletedAt: null
            },
            include: [
                {
                    model: SurveyAssigned,
                    order: [['createdAt', 'DESC']]
                }
                ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        })
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        Surveys.hasMany(BlacklistedSurveys, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveysPartners, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveyTemplates, { foreignKey: 'surveyId' });
        let user = []
        let assignUsers =[]
        const data = await Surveys.findOne({where: {id: req.params.id, deletedAt: null},
            include: [
                {
                    model: BlacklistedSurveys,
                },
                {
                    model: SurveysPartners,
                },
                {
                    model: SurveyTemplates,
                }
            ],
        })
            return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOneDetails = async (req, res) => {
    try {
        Surveys.hasMany(BlacklistedSurveys, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveysPartners, { foreignKey: 'surveyId' });
        Surveys.hasMany(SurveyTemplates, { foreignKey: 'surveyId' });
        let user = []
        let assignUsers =[]
        const data = await Surveys.findOne({where: {id: req.params.id, deletedAt: null},
            include: [
                {
                    model: BlacklistedSurveys,
                },
                {
                    model: SurveysPartners,
                },
                {
                    model: SurveyTemplates,
                }
            ],
        })
        const scheduleEmail = await SurveyEmailSchedules.findOne({where: {
                surveyId: data.id,
                deletedAt: null,
            }})
        if(scheduleEmail) {
            const sample = await Samples.findOne({where: {id: scheduleEmail.sampleId, deletedAt: null}})
            const sampleQuestions = await SamplesQuestions.findAll({where: {sampleId: sample.id, deletedAt: null}})
            if (sample) {
                let whereClause = {};

                // Gender filter
                if (sample.gender) {
                    whereClause.gender = sample.gender;
                }

                // Age filter
                if (sample.fromAge || sample.toAge) {
                    whereClause.dateOfBirth = {
                        [Op.between]: [calculateBirthDate(sample.toAge), calculateBirthDate(sample.fromAge)]
                    };
                }

                // Registration date filter
                if (sample.fromRegistrationDate && sample.toRegistrationDate) {
                    whereClause.createdAt = {
                        [Op.between]: [new Date(sample.fromRegistrationDate), new Date(sample.toRegistrationDate)]
                    };
                }

                // States filter
                if (sample.stateIds && sample.stateIds.length > 0) {
                    const states = sample.stateIds.map((item => item.label))
                    whereClause.state = {
                        [Op.in]: states
                    };
                }

                // Cities filter
                if (sample.cityIds && sample.cityIds.length > 0) {
                    const city = sample.cityIds.map((item => item.label))
                    whereClause.city = {
                        [Op.in]: city
                    };
                }

                //Segments
                if(sample.segments && sample.segments.length > 0) {
                    let obj = {}
                    const segments = sample.segments.map((item => item.label))
                    obj.segment = {
                        [Op.in]: segments
                    };
                    const segmentsCities = await Cities.findAll({ where: obj, attributes: ['name', 'segment'], raw: true })
                    if(segmentsCities.length > 0) {
                        const city = segmentsCities.map((item => item.name))
                        whereClause.city = {
                            [Op.in]: city
                        };
                    }
                }

                //Regions
                if(sample.regions && sample.regions.length > 0) {
                    let obj = {}
                    const regions = sample.regions.map((item => item.label))
                    obj.region = {
                        [Op.in]: regions
                    };
                    const regionsCities = await Cities.findAll({ where: obj, attributes: ['name', 'region'], raw: true })
                    if(regionsCities.length > 0) {
                        const city = regionsCities.map((item => item.name))
                        whereClause.city = {
                            [Op.in]: city
                        };
                    }
                }

                BasicProfile.belongsTo(Users, {foreignKey: 'userId'});
                console.log('whereClause--->', whereClause)
                let usersQuery = await BasicProfile.findAll({
                    where: whereClause,
                    include: [
                        {
                            model: Users,
                            required: false,
                            attributes: ['email', 'role']
                        },
                    ],
                });

                if(sampleQuestions.length > 0) {
                    let usersResponseList = await filterUserResponses(sampleQuestions);
                    const userIdArray = usersResponseList.map(userResponse => userResponse.get('userId'));
                    let usersQuestionCriteria = await BasicProfile.findAll({
                        where: {
                            userId: {
                                [Op.in]: userIdArray,
                            },
                        },
                        include: [
                            {
                                model: Users,
                                required: false,
                                attributes: ['email', 'role']
                            },
                        ],
                    })
                    const filterCommonUsers = (arrA, arrB) => {
                        return arrA.filter(userA => arrB.some(userB => userB.userId === userA.userId));
                    };
                    usersQuery = filterCommonUsers(usersQuestionCriteria, usersQuery);
                }

                user = usersQuery.filter(item => item.user ? item.user.role === 'panelist' : '')
                assignUsers = await SurveyAssigned.findAll({where: {surveyId: data.id}})
            }
        }
        return apiResponses.successResponseWithData(res, 'success!', { data, user, assignUsers });
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Surveys.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.AddPartners = async (req, res) => {
    try {
        let surveyId = null
        if(req.body.partners) {
            const newArray = req.body.partners.map(item => {
                surveyId = item.surveyId
                return {
                    ...item,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                };
            });
            await SurveysPartners.destroy({where: {surveyId: surveyId}})
            console.log('newArray--->', newArray)
            const Option = await SurveysPartners.bulkCreate(newArray)
        }
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        console.log('error--->', err)
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.GetUserAllAssignedSurvey = async (req, res) => {
    try {
        SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
        const surveysList = await SurveyAssigned.findAll({
            where: {
                userId: req.params.userId
            },
                include: [
                    {
                        model: Surveys,
                        required: false,
                        attributes: ['name', 'description', 'surveyLength', 'ceggPoints', 'expiryDate', "description_one", "description_two", "description_three", "description_four", "colorcode"]
                    },
                ],
                limit: 100000,
            order: [['createdAt', 'DESC']]
        })
        return apiResponses.successResponseWithData(res, 'Success', surveysList);
    } catch (err) {
        console.log('erro-->', err)
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.GetUserOneAssignedSurvey = async (req, res) => {
    try {
        SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
        const surveysDetails = await SurveyAssigned.findOne({
            where: {
                id: req.params.id},
                include: [
                    {
                        model: Surveys,
                        required: false,
                        attributes: ['name', 'description', 'ceggPoints', 'expiryDate', "description_one", "description_two", "description_three", "description_four", "colorcode"]
                    },
                ]
        })
        return apiResponses.successResponseWithData(res, 'Success', surveysDetails);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

function appendPartnerUrl(url, userId, data) {
    console.log('userId-->', userId, data)
    data['userId'] = userId;
    const baseUrl = url
    const urlParams = new URLSearchParams(data);
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${urlParams.toString()}`
}

const appendValuesToUrl = (url, rid, sid) => {
    const hasRid = url.includes('{svar_id}');
    if (hasRid) {
        url = url.replace('{respondent_id}', rid);
        url = url.replace('{svar_id}', sid);
        return url
    } else {
        return url.replace('{respondent_id}', rid);
    }
};

module.exports.GetUserOneAssignedSurveyCallback = async (req, res) => {
    try {
        SurveyAssigned.belongsTo(Surveys, { foreignKey: 'surveyId' });
        const partnerSurvey = await PartnerUsers.findOne({ where: { id: req.body.userId }, raw: true})
        if(partnerSurvey) {
            let url = null
            const partnerInfo = await Partners.findOne({where: {id: partnerSurvey.partner_id}, raw: true})
            if (partnerInfo && req.body.status === 'Completed') {
                url = appendValuesToUrl(partnerInfo.successUrl, partnerSurvey.rid, partnerSurvey.sid)
            }
            if (partnerInfo && req.body.status === 'Over Quota') {
                url = appendValuesToUrl(partnerInfo.overQuotaUrl, partnerSurvey.rid, partnerSurvey.sid)
            }
            if (partnerInfo && req.body.status === 'Quality Terminated') {
                url = appendValuesToUrl(partnerInfo.badTerminatedUrl, partnerSurvey.rid, partnerSurvey.sid)
            }
            if (partnerInfo && req.body.status === 'Terminated') {
                url = appendValuesToUrl(partnerInfo.disqualifiedUrl, partnerSurvey.rid, partnerSurvey.sid)
            }
            await PartnerUsers.update({
                    status: req.body.status,
                    updatedAt: new Date().valueOf()
                },
                {
                    where: {
                        id: req.body.userId
                    }
                })
            return apiResponses.successResponseWithData(res, 'Success', {surveysDetails: null, user: null, url});
        } else {
            await SurveyAssigned.update({
                    status: req.body.status,
                    partnerid: req.body.partnerId,
                    updatedAt: new Date().valueOf()
                },
                {
                    where: {
                        temporarySurveyLinkId: req.body.surveyId,
                        userId: req.body.userId
                    }
                })
            const surveysDetails = await SurveyAssigned.findOne({
                where: {
                    temporarySurveyLinkId: req.body.surveyId,
                    userId: req.body.userId
                },
                attributes: ['id', 'updatedAt', 'surveyId'],
                include: [
                    {
                        model: Surveys,
                        required: false,
                        attributes: ['name', 'description', 'ceggPoints', 'expiryDate', 'createdAt', 'disclaimer', 'country']
                    }
                ]
            })
            const user = await BasicProfile.findOne({
                where: {userId: req.body.userId},
                attributes: ['firstName', 'lastName']
            })

            if (req.body.status === 'Completed' && surveysDetails && surveysDetails.survey) {
                const Reward = await Rewards.create({
                    points: surveysDetails.survey.ceggPoints,
                    rewardType: 'Survey',
                    surveyId: surveysDetails.surveyId,
                    rewardStatus: 'Pending',
                    userId: req.body.userId,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                    rewardDate: new Date().valueOf(),
                })
            }
            if (req.body.partnerId && req.body.partnerId !== 'NA') {
                let url = null
                const partnerInfo = await Partners.findOne({where: {id: req.body.partnerId}, raw: true})
                if (partnerInfo && req.body.status === 'Completed') {
                    url = `${partnerInfo.successUrl}?userid=${req.body.userId}&surveyid=${req.body.surveyId}&partnerid=${req.body.partnerId}`;
                }
                if (partnerInfo && req.body.status === 'Over Quota') {
                    url = `${partnerInfo.overQuotaUrl}?userid=${req.body.userId}&surveyid=${req.body.surveyId}&partnerid=${req.body.partnerId}`;
                }
                if (partnerInfo && req.body.status === 'Quality Terminated') {
                    url = `${partnerInfo.badTerminatedUrl}?userid=${req.body.userId}&surveyid=${req.body.surveyId}&partnerid=${req.body.partnerId}`;
                }
                if (partnerInfo && req.body.status === 'Terminated') {
                    url = `${partnerInfo.disqualifiedUrl}?userid=${req.body.userId}&surveyid=${req.body.surveyId}&partnerid=${req.body.partnerId}`;
                }
                return apiResponses.successResponseWithData(res, 'Success', {surveysDetails, user, url});
            } else {
                return apiResponses.successResponseWithData(res, 'Success', {surveysDetails, user, url: ''});
            }
        }
    } catch (err) {
        console.log('err-r-->', err)
        return apiResponses.errorResponse(res, err);
    }
};




module.exports.userRespondentDashboard = async (req, res) => {
    try {
        const {
            totalSurveys,
            incompleteSurveys,
            completeSurveys,
            notStartedSurveys,
            overallAttemptedPercentage,
            totalRewardPoints,
            totalReferralsPoints,
            totalReferralsApproved,
            totalLeft
        } = await respondentSummary(req.params.userId);

        let obj = [{
                name: "Total Survey",
                points: totalSurveys || 0
            },
            {
                name: "Incomplete Survey",
                points: incompleteSurveys || 0
            },
             {
                name: "Complete Survey",
                points: completeSurveys || 0
            },
             {
                name: "Survey Not Started",
                points: notStartedSurveys || 0
            },
            {
                name: "Profile Pending",
                points: 100 - overallAttemptedPercentage || 0
            },
            {
                name: "Rewards Points",
                points: totalRewardPoints || 0
            },
             {
                name: "Referrals Points",
                points: totalReferralsPoints || 0
            },
             {
                name: "Referrals Statistics",
                points: 0
            },
            {
                name: "Total Left Points",
                points: totalLeft || 0
            },
             {
                name: "Total Referrals Approved",
                points: totalReferralsApproved || 0
            },
        ]
        return apiResponses.successResponseWithData(res, 'Success', obj);
    } catch (err) {
        console.log('err-r-->', err)
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.userRespondentDashboardWeb = async (req, res) => {
    try {
        const {
            totalSurveys,
            incompleteSurveys,
            completeSurveys,
            notStartedSurveys,
            overallAttemptedPercentage,
            totalRewardPoints,
            totalReferralsPoints,
            totalReferralsApproved,
            totalLeft
        } = await respondentSummary(req.params.userId);


        let obj = {
            totalSurveys: {
                name: "Total Survey",
                points: totalSurveys || 0
            },
            incompleteSurveys: {
                name: "Incomplete Survey",
                points: incompleteSurveys || 0
            },
            completeSurveys: {
                name: "Complete Survey",
                points: completeSurveys || 0
            },
            notStartedSurveys: {
                name: "Survey Not Started",
                points: notStartedSurveys || 0
            },
            overallAttemptedPercentage: {
                name: "Profile Pending",
                points: 100 - overallAttemptedPercentage || 0
            },
            totalRewardPoints: {
                name: "Rewards Points",
                points: totalRewardPoints || 0
            },
            totalReferralsPoints: {
                name: "Referrals Points",
                points: totalReferralsPoints || 0
            },
            totalReferralsStatistics: {
                name: "Referrals Statistics",
                points: 0
            },
            totalLeft: {
                name: "Total Left Points",
                points: totalLeft || 0
            },
            totalReferralsApproved: {
                name: "Total Referrals Approved",
                points: totalReferralsApproved || 0
            },
        }
        return apiResponses.successResponseWithData(res, 'Success', obj);
    } catch (err) {
        console.log('err-r-->', err)
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.adminRespondentDashboardWeb = async (req, res) => {
    try {
            db.profiles.hasMany(db.questions, {foreignKey: 'profileId'});
            db.questions.belongsTo(db.profiles, {foreignKey: 'profileId'});
            db.profiles.hasMany(ProfileUserResponses, {foreignKey: 'profileId'});
            const totalSurveys = await SurveyAssigned.count()
            const incompleteSurveys = await SurveyAssigned.count({
                where: {
                    status: "pending",
                    isStarted: true
                }
            })
            const completeSurveys = await SurveyAssigned.count({
                where: {
                    status: {
                        [Op.not]: 'pending'
                    },
                    isStarted: true
                }
            })
            const notStartedSurveys = await SurveyAssigned.count({
                where: {
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

            const totalRewardPoints = await Rewards.sum('points');
            const totalReferralsPoints = await Rewards.sum('points', {
                where: {
                    rewardType: 'Referral'
                }
            });
            const totalReferralsApproved = await Rewards.sum('points', {
                where: {
                    rewardType: 'Accepted'
                }
            });

            const totalRedeemedData = await RedemptionRequests.findAll({
                where: { deletedAt: null, redemptionRequestStatus: 'Redeemed'},
            });
            const totalPendingData = await RedemptionRequests.findAll({
                where: {deletedAt: null, redemptionRequestStatus: 'New'},
            });

            const totalRedeemed = totalRedeemedData.reduce((sum, reward) => sum + reward.pointsRedeemed, 0);
            const totalPendingRedeemed = totalPendingData.reduce((sum, reward) => sum + reward.pointsRequested, 0);
            const totalLeft = totalRewardPoints - totalRedeemed

        let obj = {
            totalSurveys: {
                name: "Total Survey",
                points: totalSurveys || 0
            },
            incompleteSurveys: {
                name: "Incomplete Survey",
                points: incompleteSurveys || 0
            },
            completeSurveys: {
                name: "Complete Survey",
                points: completeSurveys || 0
            },
            notStartedSurveys: {
                name: "Survey Not Started",
                points: notStartedSurveys || 0
            },
            overallAttemptedPercentage: {
                name: "Profile Pending",
                points: 100 - overallAttemptedPercentage || 0
            },
            totalRewardPoints: {
                name: "Rewards Points",
                points: totalRewardPoints || 0
            },
            totalReferralsPoints: {
                name: "Referrals Points",
                points: totalReferralsPoints || 0
            },
            totalReferralsStatistics: {
                name: "Referrals Statistics",
                points: 0
            },
            totalLeft: {
                name: "Total Left Points",
                points: totalLeft || 0
            },
            totalReferralsApproved: {
                name: "Total Referrals Approved",
                points: totalReferralsApproved || 0
            },
        }
        return apiResponses.successResponseWithData(res, 'Success', obj);
    } catch (err) {
        console.log('err-r-->', err)
        return apiResponses.errorResponse(res, err);
    }
};



const filterUserResponses = async (sampleQuestions) => {
    const allUserResponses = await ProfileUserResponses.findAll({
        where: {
            deletedAt: null,
        },
    });

    const Operands = {
        All: 1,
        ANSWERED: 2,
        ANY: 3,
        EXCEPT: 4,
        NOT_ANSWERED: 5,
    };

    return allUserResponses.filter(userResponse => {
        return sampleQuestions.every(({ questionId, operand, optionIds }) => {
            const responseValue = userResponse.get('response')[questionId];

            const checkOptionValue = (value) => {
                if (Array.isArray(optionIds)) {
                    return Array.isArray(value)
                        ? optionIds.every(opt => value.includes(opt))
                        : optionIds.includes(value);
                } else {
                    return Array.isArray(value)
                        ? value.includes(optionIds)
                        : value === optionIds;
                }
            };

            switch (operand) {
                case Operands.All:
                    return responseValue;
                case Operands.ANSWERED:
                    return responseValue && checkOptionValue(responseValue);
                case Operands.ANY:
                    return responseValue;
                case Operands.EXCEPT:
                    return !(responseValue && checkOptionValue(responseValue));
                case Operands.NOT_ANSWERED:
                    return !(responseValue && checkOptionValue(responseValue));
                default:
                    // Handle default case if needed
                    return false;
            }
        });
    });
};


module.exports.createSurveyPartnerUser = async (req, res) => {
    try {
        const isSurveyExist = await Surveys.findOne({ where: { id: req.body.surveyId, deletedAt: null }})
        const isExist = await PartnerUsers.findOne({ where: { ip: req.ip, rid: req.body.userId, survey_id: req.body.surveyId, partner_id: req.body.partnerId, deletedAt: null }})
        console.log(isExist)
        if(isSurveyExist) {
            if (!isExist) {
                const UserInfo = await PartnerUsers.create({
                    ip: req.ip,
                    rid: req.body.userId,
                    sid: req.body.sid,
                    status: 'Pending',
                    extra_string: req.body.params,
                    survey_id: req.body.surveyId,
                    partner_id: req.body.partnerId,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                })

                const surveyInfo = await Surveys.findOne({where: {id: req.body.surveyId, deletedAt: null }, raw: true})
                const originalSurveyLink = appendParamsToUrl(surveyInfo.url, UserInfo.id, req.body.surveyId)
                return apiResponses.successResponseWithData(
                    res,
                    'Success!',
                    originalSurveyLink
                );
            } else {
                const surveyInfo = await Surveys.findOne({where: {id: req.body.surveyId, deletedAt: null }, raw: true})
                const originalSurveyLink = appendParamsToUrl(surveyInfo.url, isExist.id, req.body.surveyId)
                return apiResponses.successResponseWithData(
                    res,
                    'Success!',
                    originalSurveyLink
                );
            }
        } else {
            return apiResponses.validationErrorWithData(
                res,
                'Survey is not exist!',
                null
            );
        }
    } catch (err) {
        console.log('erre--->', err)
        return apiResponses.errorResponse(res, err);
    }
};



module.exports.getAllPartnerUsers = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await PartnerUsers.findAll({
            where: {
                deletedAt: null,
                partner_id: req.params.id,
                survey_id: req.params.surveyId
            },
            attributes: {
                exclude: ['extra_string'],
            },
            raw: true,
            order: [['createdAt', 'DESC']],
        })
        const newArray = [];
        for (const item of data) {
            const partnerDetails = await getPartnerDetails(item.partner_id);
            console.log('partnerDetails--->', partnerDetails)
            if (partnerDetails) {
                const enrichedItem = {
                    ...item,
                    partnerName: partnerDetails.name,
                };

                newArray.push(enrichedItem);
            }
        }

        const final = [];
        for (const item of newArray) {
            const partnerDetails = await getSurveyDetails(item.survey_id);
            console.log('partnerDetails--->', partnerDetails)
            if (partnerDetails) {
                const enrichedItem = {
                    ...item,
                    surveyName: partnerDetails.name,
                    country: partnerDetails.country,
                };

                final.push(enrichedItem);
            }
        }
        return apiResponses.successResponseWithData(res, 'success!', final);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


const getPartnerDetails = async (partnerId) => {
    try {
        return await Partners.findOne({
            where: {
                id: partnerId,
            },
            raw: true,
            attributes: ['name'],
        });
    } catch (error) {
        console.error('Error fetching partner details:', error.message);
        return null;
    }
};

const getSurveyDetails = async (surveyId) => {
    try {
        return await Surveys.findOne({
            where: {
                id: surveyId,
            },
            raw: true,
            attributes: ['name', 'country'],
        });
    } catch (error) {
        console.error('Error fetching partner details:', error.message);
        return null;
    }
};
