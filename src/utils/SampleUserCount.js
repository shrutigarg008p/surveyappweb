const db = require('../models');
const Samples = db.sample;
const SamplesQuestions = db.sampleQuestions;
const Questions = db.questions;
const Options = db.options;
const BasicProfile = db.basicProfile;
const ProfileUserResponses = db.profileUserResponse;
const SurveyUniqueLinks = db.surveyUniqueLinks;
const SurveyEmailSchedule = db.surveyEmailSchedule;
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

function mapGender(gender) {
    return gender === 'Male' ? ["Male", 'male', 'पुरुष'] :
        gender === 'Female' ? ["Female", "महिला", 'female'] :
            ["Other", 'other', "अन्य"];
}


async function sampleTotalUserCount(sampleId) {
    try {
        const sample = await Samples.findOne({where: {id: sampleId, deletedAt: null}})
        let user = []
        const sampleQuestions = await SamplesQuestions.findAll({where: {sampleId: sample.id, deletedAt: null}})
        let totalCount = 0
        if (sample) {
            let limit = 1000000
            if (sample.profileCount > 0) {
                limit = sample.profileCount;
            }

            let whereClause = {};

            // // Age filter
            if (sample.fromAge || sample.toAge) {
                whereClause.dateOfBirth = {
                    [Op.between]: [calculateBirthDate(sample.toAge), calculateBirthDate(sample.fromAge)]
                };
            }

            // Gender filter
            if (sample.gender) {
                whereClause.gender = {
                    [Op.in]: sample.gender === 'Male' ? ["Male", 'male', 'पुरुष'] : sample.gender === 'Female' ? ["Female", "महिला", 'female'] : ["Others", 'others', "अन्य"]
                };
            }


            let genderWhereClosure = []

            if (sample.genders && sample.genders.length > 0) {
                sample.genders.length > 0 && sample.genders.forEach(range => {
                    const {gender, fromAge, toAge} = range;
                    if (gender !== undefined && fromAge !== undefined && toAge !== undefined) {
                        const today = new Date();
                        const birthDateFrom = new Date(today.getFullYear() - toAge, today.getMonth(), today.getDate());
                        const birthDateTo = new Date(today.getFullYear() - fromAge, today.getMonth(), today.getDate());

                        const formattedBirthDateFrom = `to_date('${birthDateFrom.toISOString().split('T')[0]}', 'YYYY-MM-DD')`;
                        const formattedBirthDateTo = `to_date('${birthDateTo.toISOString().split('T')[0]}', 'YYYY-MM-DD')`;

                        const mappedGender = gender.flatMap(g => mapGender(g.label));

                        const condition = {
                            [Op.and]: [
                                Sequelize.literal(`to_date("basic_profile"."dateOfBirth", 'YYYY-MM-DD') BETWEEN ${formattedBirthDateFrom} AND ${formattedBirthDateTo}`),
                                Sequelize.literal(`ARRAY[${mappedGender.map(g => `'${g}'`).join(',')}]::text[] @> ARRAY["basic_profile"."gender"]::text[]`)
                            ]
                        };
                        genderWhereClosure.push(condition);
                    }
                });
            }


            let genderClause = {}
            if (genderWhereClosure.length > 0) {
                genderClause = {
                    [Op.or]: genderWhereClosure
                };
            }

            // Registration date filter
            if (sample.fromRegistrationDate && sample.toRegistrationDate) {
                whereClause.createdAt = {
                    [Op.between]: [new Date(sample.fromRegistrationDate), new Date(sample.toRegistrationDate)]
                };
            }

            let allCities = []
            if (sample.stateIds && sample.stateIds.length > 0) {
                const states = sample.stateIds.map((item => item.value))
                const statesInfo = await Cities.findAll({
                    where: {stateId: {[Op.in]: states}},
                    attributes: ['name', 'hindi', 'zipCode'],
                    raw: true
                })
                const zipcodes = statesInfo.map(item => item.zipCode);
                const names = statesInfo.map(item => item.name);
                const hindiNames = statesInfo.map(item => item.hindi);
                const stringArray = names.concat(hindiNames);
                allCities.push(...zipcodes);
            }

            // Cities filter
            if (sample.cityIds && sample.cityIds.length > 0) {
                const city = sample.cityIds.map((item => item.label))
                const statesInfo = await Cities.findAll({
                    where: {name: {[Op.in]: city}},
                    attributes: ['name', 'hindi', 'zipCode'],
                    raw: true
                })
                const zipcodes = statesInfo.map(item => item.zipCode);
                const names = statesInfo.map(item => item.name);
                const hindiNames = statesInfo.map(item => item.hindi);
                const stringArray = names.concat(hindiNames);
                allCities.push(...zipcodes);

            }

            //Segments
            if (sample.segments && sample.segments.length > 0) {
                let obj = {}
                const segments = sample.segments.map((item => item.label))
                obj.segment = {
                    [Op.in]: segments
                };
                const segmentsCities = await Cities.findAll({
                    where: obj,
                    attributes: ['name', 'hindi', 'zipCode'],
                    raw: true
                })
                if (segmentsCities.length > 0) {
                    const zipcodes = segmentsCities.map(item => item.zipCode);
                    const names = segmentsCities.map(item => item.name);
                    const hindiNames = segmentsCities.map(item => item.hindi);
                    const stringArray = names.concat(hindiNames);
                    allCities.push(...zipcodes);
                    // whereClause.city = {
                    //     [Op.in]: city
                    // };
                }
            }

            //Regions
            if (sample.regions && sample.regions.length > 0) {
                let obj = {}
                const regions = sample.regions.map((item => item.label))
                obj.region = {
                    [Op.in]: regions
                };
                const regionsCities = await Cities.findAll({
                    where: obj,
                    attributes: ['name', 'region', 'hindi', 'zipCode'],
                    raw: true
                })
                if (regionsCities.length > 0) {
                    const zipcodes = regionsCities.map(item => item.zipCode);
                    const names = regionsCities.map(item => item.name);
                    // const hindiNames = regionsCities.map(item => item.hindi);
                    const stringArray = names.concat([]);
                    allCities.push(...zipcodes);
                    // whereClause.city = {
                    //     [Op.in]: city
                    // };
                }
            }

            if (allCities.length > 0) {
                whereClause.pinCode = {
                    [Op.in]: allCities
                };
            }

            whereClause = {
                [Op.and]: [
                    whereClause,
                    genderClause
                ]
            };

            BasicProfile.belongsTo(Users, {foreignKey: 'userId'});
            console.log('whereClause--->', whereClause, limit)
            user = await BasicProfile.findAll({
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['email', 'role'],
                        where: {role: 'panelist'}
                    },
                ],
                where: whereClause,
                limit: limit,
            });
        }
        if (sampleQuestions.length > 0) {
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
                // limit: limit,
                // offset: offset,
            })
            const filterCommonUsers = (arrA, arrB) => {
                return arrA.filter(userA => arrB.some(userB => userB.userId === userA.userId));
            };
            const commonUsers = filterCommonUsers(usersQuestionCriteria, user);
            let filteredUsers = commonUsers.filter(item => item.user ? item.user.role === 'panelist' : '')
            return {
                sample,
                totalCount: filteredUsers.length
            }
        }
        return {
            sample,
            totalCount: user.length
        }
    } catch (err) {
        console.log('error--->', err)
        return {
            sample: { name: "NA" },
            totalCount: 0
        }
    }
}


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


module.exports = {
    sampleTotalUserCount
}
