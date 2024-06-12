const {body, sanitizeBody, validationResult} = require('express-validator');
const apiResponses = require('../Components/apiresponse');
const db = require("../models");
const RedemptionMode = db.redemptionMode;


const createRedemption = [
    body('name').isLength({min: 1})
        .trim().withMessage('name must be specified.'),
    body('description').isLength({min: 1})
        .trim().withMessage('description must be specified.'),
    body('minimumPoints').isLength({min: 1})
        .trim().withMessage('minimumPoints must be specified.'),
    body('useName').isLength({min: 1})
        .trim().withMessage('useName must be specified.'),
    body('usePhone').isLength({min: 1})
        .trim().withMessage('usePhone must be specified.'),
    body('useAddress').isLength({min: 1})
        .trim().withMessage('useAddress must be specified.'),
    body('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponses.validationErrorWithData(
                res, 'Please enter valid credentials.', errors.array(),
            );
        } else {
            next();
        }
    }];


const redemptionValidator = {
    createRedemption,
};

module.exports = redemptionValidator;
