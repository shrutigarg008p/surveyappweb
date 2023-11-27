const db = require('../models');
const Samples = db.sample;
const apiResponses = require('../Components/apiresponse');
const {DataTypes} = require("sequelize");

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
        const data = await Samples.findOne({where: {id: req.params.id, deletedAt: null},
        })
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
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
