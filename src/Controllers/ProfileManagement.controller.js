const db = require('../models');
const Profiles = db.profiles;
const Questions = db.questions;
const Options = db.options;
const ProfileUserResponses = db.profileUserResponse;

const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Profiles.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Profile = await Profiles.create({
                name: req.body.name,
                description: req.body.description,
                displayOrder: req.body.displayOrder,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Profile
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
            description: req.body.description,
            displayOrder: req.body.displayOrder,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Profiles.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Profiles.update(
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
        const data = await Profiles.findAll({ where : { deletedAt: null }, limit: limit, order: [['displayOrder', 'ASC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        let data = await Profiles.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOneDetails = async (req, res) => {
    try {
        const language = req.headers['language'] || req.query.language || 'en';
        if (req.params.id && req.params.userId) {
            let data = await Profiles.findOne({
                where: {
                    id: req.params.id,
                    deletedAt: null
                }
            });

            const title = language === 'hi' ? data.hindi : data.name;

            let userResponse = await ProfileUserResponses.findOne({
                where: {
                    profileId: req.params.id,
                    userId: req.params.userId,
                    deletedAt: null
                }
            });

            if (!data) {
                return apiResponses.validationErrorWithData(res, 'Profile not found');
            }

            Questions.hasMany(Options, { foreignKey: 'questionId' });
            const questions = await Questions.findAll({
                where: {
                    profileId: req.params.id,
                    deletedAt: null,
                    isActive: true
                },
                include: [
                    {
                        model: Options,
                        required: false,
                        where: { isActive: true },
                        separate: true,
                        order: [['displayOrder', 'ASC']],
                    },
                ],
                order: [['displayOrder', 'ASC']]
            });

            // Modify the response to include the 'title' key for questions and options
            let response = {
                data: {
                    ...data.dataValues,
                    name: title,
                },
                questions: questions.map(question => ({
                    ...question.dataValues,
                    name: language === 'hi' ? question.hindi : question.text,
                    options: question.options.map(option => ({
                        ...option.dataValues,
                        name: language === 'hi' ? option.hindi : option.value,
                    })),
                })),
                response: userResponse ? userResponse : {}
            };

            return apiResponses.successResponseWithData(res, 'success!', response);
        } else {
            return apiResponses.validationErrorWithData(res, 'UserId or Profile id not found');
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.delete = async (req, res) => {
    try {
        await Profiles.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.createUserProfiles = async (req, res) => {
    try {
        const isExist = await ProfileUserResponses.findOne({ where: { userId: req.body.userId, profileId: req.body.profileId, deletedAt: null }})
        if(!isExist) {
            const Profile = await ProfileUserResponses.create({
                userId: req.body.userId,
                profileId: req.body.profileId,
                response: req.body.response,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Profile
            );
        } else {
            let obj = {
                response: req.body.response,
                updatedAt: new Date().valueOf(),
            }
            const profile = await ProfileUserResponses.update(
                obj, { where: {
                    userId: req.body.userId,
                    profileId: req.body.profileId,
                    deletedAt: null
                }}
            )
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                profile
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

