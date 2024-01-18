const db = require('../models');
const Questions = db.questions;
const Options = db.options;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Questions.findOne({ where: { text: req.body.text, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Question = await Questions.create({
                text: req.body.text,
                profileId: req.body.profileId,
                displayOrder: req.body.displayOrder,
                hint: req.body.hint,
                displayType: req.body.displayType,
                isActive: req.body.isActive,
                dataType: req.body.dataType,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            if(Question){
                const newArray = req.body.options.map(item => {
                    return {
                        ...item,
                        questionId: Question.id,
                        value: item.value,
                        displayOrder: parseInt(item.displayOrder, 10),
                        createdAt: new Date().valueOf(),
                        updatedAt: new Date().valueOf(),
                    };
                });
                const Option = await Options.bulkCreate(newArray)
            }
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Question
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


module.exports.update = async (req, res) => {
    try {
        let obj = {
            text: req.body.text,
            profileId: req.body.profileId,
            displayOrder: req.body.displayOrder,
            hint: req.body.hint,
            displayType: req.body.displayType,
            isActive: req.body.isActive,
            dataType: req.body.dataType,
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Questions.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Questions.update(
                obj, { where: { id: req.params.id } }
            )

            const optionsToUpdate = req.body.options.filter(item => item.id);
            const optionsToInsert = req.body.options.filter(item => !item.id);

            if(optionsToInsert.length > 0 ) {
                const newArray = optionsToInsert.map(item => {
                    return {
                        ...item,
                        questionId: req.params.id,
                        displayOrder: parseInt(item.displayOrder, 10),
                        createdAt: new Date().valueOf(),
                        updatedAt: new Date().valueOf(),
                    };
                });
                const Option = await Options.bulkCreate(newArray)
            }

            if(optionsToUpdate.length > 0 ) {
                const newArray = optionsToUpdate.map(item => {
                    return {
                        ...item,
                        questionId: req.params.id,
                        displayOrder: parseInt(item.displayOrder, 10),
                        createdAt: new Date().valueOf(),
                        updatedAt: new Date().valueOf(),
                    };
                });
                await Options.bulkCreate(newArray, {
                    updateOnDuplicate: ['value', 'hint', 'displayOrder', 'isActive', 'updatedAt'],
                });
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
        const data = await Questions.findAll({where: {profileId: req.params.profileId, deletedAt: null}, limit: limit, order: [['displayOrder', 'ASC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Questions.findOne({where: {id: req.params.id, deletedAt: null}})
        const options = await Options.findAll({where: {questionId: data.id, deletedAt: null, order: [['displayOrder', 'ASC']]}})
        return apiResponses.successResponseWithData(res, 'success!', {...data, options});
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.getQuestionOptions = async (req, res) => {
    try {
        const options = await Options.findAll({where: {questionId: req.params.id, deletedAt: null, order: [['displayOrder', 'ASC']]}})
        return apiResponses.successResponseWithData(res, 'success!', options);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Questions.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        // await Options.update({
        //         deletedAt: new Date().valueOf(),
        //     },
        //     { where: { profileId : req.params.id },
        //     })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


const jsonFile = require('../../questions2024.json')
async function questionsImport() {
    console.log(jsonFile)
    for(let i = 0; i < jsonFile.length; i++) {
        const isExist = await Questions.findOne({where: {text: jsonFile[i].text, deletedAt: null}})
        console.log(isExist)
        if (!isExist) {
            console.log('llllll----->', jsonFile[i])
            const Question = await Questions.create({
                text: jsonFile[i].text,
                profileId: jsonFile[i].profileId,
                displayOrder: jsonFile[i].displayOrder,
                questionId: jsonFile[i].questionId,
                hint: jsonFile[i].hint,
                displayType: jsonFile[i].displayType,
                isActive: true,
                dataType: jsonFile[i].dataType,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
        }
    }

}

// questionsImport()

const jsonFileOption = require('../../options2024.json')
async function OptionsImport() {
    // console.log(jsonFileOption)
    for(let i = 0; i < jsonFileOption.length; i++) {
            const isExist = await Questions.findOne({where: {questionId: jsonFileOption[i].questionId}})
            console.log(isExist)
            if (isExist) {
                console.log('llllll----->', i)
                const Question = await Options.create({
                    value: jsonFileOption[i].value,
                    questionId: isExist.id,
                    displayOrder: jsonFileOption[i].displayOrder,
                    hint: jsonFileOption[i].hint,
                    isActive: true,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                })
            }
        }
}

// OptionsImport()
