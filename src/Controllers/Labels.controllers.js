const db = require('../models');
const Labels = db.labels;
const ApplicationAssignUser = db.applicationAssignUser;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Labels.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Country = await Labels.create({
                name: req.body.name,
                description: req.body.description,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                Country
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
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Labels.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Labels.update(
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
        const data = await Labels.findAll({ deletedAt: null, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Labels.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Labels.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.createApplicationAssignUser = async (req, res) => {
    try {
            const newArray = req.body.options.map(item => {
                return {
                    applicationUser_id: item.applicationUser_id,
                    label_id: item.label_id,
                    createdAt: new Date().valueOf(),
                    updatedAt: new Date().valueOf(),
                };
            });
            const assign = await ApplicationAssignUser.bulkCreate(newArray)
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                assign
            );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
