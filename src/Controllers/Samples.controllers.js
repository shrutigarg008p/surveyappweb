const db = require('../models');
const Samples = db.sample;
const SamplesQuestions = db.sampleQuestions;
const Questions = db.questions;
const Options = db.options;
const BasicProfile = db.basicProfile;
const ProfileUserResponses = db.profileUserResponse;
const Users = db.user;
const Cities = db.city;
const States = db.states;
const apiResponses = require('../Components/apiresponse');
const {DataTypes, Op} = require("sequelize");
const Sequelize = require("sequelize");

function calculateBirthDate(age) {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
}

module.exports.create = async (req, res) => {
    try {
        const isExist = await Samples.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Survey = await Samples.create({
                name: req.body.name,
                description: req.body.description,
                isActive: req.body.isActive,
                profileCount: req.body.profileCount,
                gender: req.body.gender,
                fromAge: req.body.fromAge,
                toAge: req.body.toAge,
                fromRegistrationDate: req.body.fromRegistrationDate,
                toRegistrationDate: req.body.toRegistrationDate,
                stateIds: req.body.stateIds,
                cityIds: req.body.cityIds,
                tierIds: req.body.tierIds,
                segments: req.body.segments,
                regions: req.body.regions,
                secIds: req.body.secIds,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
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
            description: req.body.description,
            isActive: req.body.isActive,
            profileCount: req.body.profileCount,
            gender: req.body.gender,
            fromAge: req.body.fromAge,
            toAge: req.body.toAge,
            fromRegistrationDate: req.body.fromRegistrationDate,
            toRegistrationDate: req.body.toRegistrationDate,
            stateIds: req.body.stateIds,
            cityIds: req.body.cityIds,
            tierIds: req.body.tierIds,
            segments: req.body.segments,
            regions: req.body.regions,
            secIds: req.body.secIds,
            updatedAt: new Date().valueOf(),
        }
            const user = await Samples.update( obj, {where: {id: req.params.id}})
            return apiResponses.successResponseWithData(res, 'Success Update', user);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await Samples.findAll({ where: { deletedAt: null }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const sample = await Samples.findOne({where: {id: req.params.id, deletedAt: null}})
        const sampleQuestions = await SamplesQuestions.findAll({where: {sampleId: sample.id, deletedAt: null}})
        let user = []
        if(sample) {
            let whereClause = {};

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

            // Gender filter
            if (sample.gender) {
                whereClause.gender = {
                    [Op.in]: sample.gender === 'Male' ? ["Male", 'male', 'पुरुष'] : sample.gender === 'Female' ? ["Female", "महिला", 'female'] : ["Others", 'others', "अन्य"]
                };
            }

            let allCities = []
            // States filter
            if (sample.stateIds && sample.stateIds.length > 0) {
                const states = sample.stateIds.map((item => item.value))
                // const statesInfo = await States.findAll({ where: {id: { [Op.in]: states } }, attributes: ['name', 'hindi'], raw: true })
                // const names = statesInfo.map(item => item.name);
                // const hindiNames = statesInfo.map(item => item.hindi);
                // const stringArray = names.concat(hindiNames);
                const statesInfo = await Cities.findAll({ where: {stateId: { [Op.in]: states } }, attributes: ['name', 'hindi'], raw: true })
                const names = statesInfo.map(item => item.name);
                const hindiNames = statesInfo.map(item => item.hindi);
                const stringArray = names.concat(hindiNames);
                allCities.push(...stringArray);
                // if (sample.cityIds && sample.cityIds.length === 0) {
                //     whereClause.city = {
                //         [Op.in]: stringArray
                //     };
                // }
                // whereClause.state = {
                //     [Op.in]: stringArray
                // };
            }

            // Cities filter
            if (sample.cityIds && sample.cityIds.length > 0) {
                const city = sample.cityIds.map((item => item.value))
                const statesInfo = await Cities.findAll({ where: {id: { [Op.in]: city } }, attributes: ['name', 'hindi'], raw: true })
                const names = statesInfo.map(item => item.name);
                const hindiNames = statesInfo.map(item => item.hindi);
                const stringArray = names.concat(hindiNames);
                allCities.push(...stringArray);

                // if(sample.segments && sample.segments.length === 0) {
                //     whereClause.city = {
                //         [Op.in]: stringArray
                //     };
                // }
            }

            //Segments
            if(sample.segments && sample.segments.length > 0) {
                let obj = {}
                const segments = sample.segments.map((item => item.label))
                obj.segment = {
                    [Op.in]: segments
                };
                const segmentsCities = await Cities.findAll({ where: obj, attributes: ['name', 'hindi'], raw: true })
                if(segmentsCities.length > 0) {
                    const names = segmentsCities.map(item => item.name);
                    const hindiNames = segmentsCities.map(item => item.hindi);
                    const stringArray = names.concat(hindiNames);
                    allCities.push(...stringArray);
                    // whereClause.city = {
                    //     [Op.in]: city
                    // };
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
                    // whereClause.city = {
                    //     [Op.in]: city
                    // };
                }
            }

            if(allCities.length > 0) {
                whereClause.city = {
                    [Op.in]: allCities
                };
            }
            BasicProfile.belongsTo(Users, {foreignKey: 'userId'});
            console.log('whereClause--->', whereClause)
            user = await BasicProfile.findAll({
                where: whereClause,
                include: [
                    {
                        model: Users,
                        required: false,
                        attributes: ['email', 'role']
                    },
                ],
            });
        }
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
            const commonUsers = filterCommonUsers(usersQuestionCriteria, user);
            let filteredUsers = commonUsers.filter(item => item.user ? item.user.role === 'panelist' : '')
            let obj = {
                sample,
                user: filteredUsers ? filteredUsers : []
            }
            return apiResponses.successResponseWithData(res, 'success!', obj);
        }
        let filteredUsers = user.filter(item => item.user ? item.user.role === 'panelist' : '')
        let obj = {
            sample,
            user: filteredUsers ? filteredUsers : []
        }
            return apiResponses.successResponseWithData(res, 'success!', obj);
    } catch (err) {
        console.log('err---->', err)
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


module.exports.delete = async (req, res) => {
    try {
        await Samples.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};



module.exports.createQuestion = async (req, res) => {
    try {
        const isExist = await SamplesQuestions.findOne({ where: { questionId: req.body.questionId, sampleId: req.body.sampleId, deletedAt: null }})
        if(!isExist) {
            const question = await SamplesQuestions.create({
                questionId: req.body.questionId,
                sampleId: req.body.sampleId,
                operand: req.body.operand,
                optionIds: req.body.optionIds ? req.body.optionIds : null,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                question
            );
        } else {
            return apiResponses.validationErrorWithData(
                res,
                'Question is already exist!',
            );
        }
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getQuestion = async (req, res) => {
    try {
        SamplesQuestions.belongsTo(Questions, { foreignKey: 'questionId' });
        SamplesQuestions.belongsTo(Options, { foreignKey: 'optionIds' });
        SamplesQuestions.belongsTo(Samples, { foreignKey: 'sampleId' });
        const data = await SamplesQuestions.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Questions,
                },
                {
                    model: Options,
                },
                {
                    model: Samples,
                },
            ],
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            data
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.getSamplesQuestions = async (req, res) => {
    try {
        SamplesQuestions.belongsTo(Questions, { foreignKey: 'questionId' });
        SamplesQuestions.belongsTo(Options, { foreignKey: 'optionIds' });
        const data = await SamplesQuestions.findAll({
            where: { sampleId: req.params.sampleId },
            include: [
                {
                    model: Questions,
                    required: false,
                },
                {
                    model: Options,
                    required: false,
                },
            ],
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            data
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.removeQuestion = async (req, res) => {
    try {
        const isExist = await SamplesQuestions.destroy({ where: { id: req.params.id }})
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            isExist
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
