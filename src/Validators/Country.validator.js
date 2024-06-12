const {body, sanitizeBody, validationResult} = require('express-validator');
const apiResponses = require('../Components/apiresponse');
const db = require("../models");
const Country = db.countries;


const create = [
    body('name').isLength({min: 1})
        .trim().withMessage('name must be specified.').custom,
    body('name').trim().escape(),
    (req, res, next) => {
        console.log('calling--,mm--')
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponses.validationErrorWithData(
                res, 'Please enter valid credentials.', errors.array(),
            );
        } else {
            next();
        }
    }];


const countryValidator = {
    create,
};

module.exports = countryValidator;
