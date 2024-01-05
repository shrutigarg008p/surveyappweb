const db = require('../models');
const Countries = db.countries;
const States = db.states;
const Cities = db.city;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const isExist = await Countries.findOne({ where: { name: req.body.name, deletedAt: null }})
        console.log(isExist)
        if(!isExist) {
            const Country = await Countries.create({
                name: req.body.name,
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
            updatedAt: new Date().valueOf(),
        }

        const isExist = await Countries.findOne({ where: { id: req.params.id, deletedAt: null } })
        if(!isExist) {
            return apiResponses.validationErrorWithData(res, 'Redemption mode not exist');
        } else {
            const user = await Countries.update(
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
        const data = await Countries.findAll({ deletedAt: null, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        const data = await Countries.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Countries.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.createState = async (req, res) => {
    try {
        const isExist = await Countries.findOne({ name: req.body.name, deletedAt: null })
        if(isExist) {
            const State = await States.create({
                name: req.body.name,
                countryId: req.body.countryId,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                State
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


module.exports.getAllStatesByCountryId = async (req, res) => {
    try {
        const limit = 10000 || req.params.limit;
        const data = await States.findAll({ where: {
                countryId: req.params.countryId,
                deletedAt: null
            }, limit: limit, order: [['createdAt', 'ASC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.getAllStatesAndCitiesByZipCode = async (req, res) => {
    try {
        const limit = 10000 || req.params.limit;
        const cities = await Cities.findAll({ where: { zipCode: req.params.zipCode, deletedAt: null }, raw: true, limit: limit, order: [['createdAt', 'ASC']]})
        let state = []
        if(cities.length > 0) {
            state = await States.findAll({
                where: { id: cities[0].stateId, deletedAt: null},
                limit: limit,
                raw: true,
                order: [['createdAt', 'ASC']]
            })
        }
            const data = { cities, state }
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAllStates = async (req, res) => {
    try {
        const limit = 10000 || req.params.limit;
        const data = await States.findAll({ where: {
                deletedAt: null
            }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};



module.exports.createCity = async (req, res) => {
    try {
        const isExist = await Countries.findOne({ name: req.body.name, deletedAt: null })
        if(isExist) {
            const State = await Cities.create({
                name: req.body.name,
                stateId: req.body.stateId,
                tier: req.body.tier,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
            return apiResponses.successResponseWithData(
                res,
                'Success!',
                State
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


module.exports.getAllCitiesByStateId = async (req, res) => {
    try {
        const limit = 10000 || req.params.limit;
        const data = await Cities.findAll( { where: {
            stateId: req.params.stateId,
           deletedAt: null
        }, limit: limit, order: [['createdAt', 'ASC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAllCities = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await Cities.findAll( { where: {
                // deletedAt: null
            }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        console.log('rttt---->', err)
        return apiResponses.errorResponse(res, err);
    }
};



const jsonFile = require('../../States.json')
async function statesImport() {
    for(let i = 0; i < jsonFile.length; i++) {
            console.log('llllll----->', i)
            const Question = await States.create({
                "name": jsonFile[i].name,
                "countryId": jsonFile[i].country_id,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
        }

}



const citiesJson = require('../../Cities.json')
async function citiesImport() {
    for(let i = 0; i < citiesJson.length; i++) {
        console.log('llllll----->', i)
        const isExist = await States.findOne({where: {name: citiesJson[i].state_name}})
        console.log(isExist)
        if (isExist) {
            const Question = await Cities.create({
                "name": citiesJson[i].name,
                "stateId": isExist.id,
                "tier": 1,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
        }
    }
}
