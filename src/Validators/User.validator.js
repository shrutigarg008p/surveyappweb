const {body, sanitizeBody, validationResult} = require('express-validator');
const apiResponses = require('../Components/apiresponse');
const db = require("../models");
const User = db.user;

const signUpValidator = [
	body('phoneNumber').isLength({min: 1})
		.trim().withMessage('Phone number must be specified.'),
	body('email')
		.isLength({min: 1})
		.trim()
		.withMessage('Email must be specified.'),
	body('password').isLength({min: 1})
		.trim().withMessage('password must be specified.'),
	    sanitizeBody('email').escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return apiResponses.validationErrorWithData(
				res, 'Please enter valid parameters', errors.array(),
			);
		} else {
			next();
		}
	}];


const updateValidator = [
	body('firstName').isLength({min: 1})
		.trim().withMessage('First name must be specified.'),
	body('lastName').isLength({min: 1})
		.trim().withMessage('Last name must be specified.'),
	body('gender').isLength({min: 1})
		.trim().withMessage('gender must be specified.'),
	body('dateOfBirth').isLength({min: 1})
		.trim().withMessage('Date Of Birth must be specified.'),
	body('referralSource').isLength({min: 1})
		.trim().withMessage('referralSource must be specified.'),
	body('addressLine1').isLength({min: 1})
		.trim().withMessage('address Line1 must be specified.'),
	body('addressLine2').isLength({min: 1})
		.trim().withMessage('address Line2 must be specified.'),
	body('state').isLength({min: 1})
		.trim().withMessage('state must be specified.'),
	body('city').isLength({min: 1})
		.trim().withMessage('city must be specified.'),
	body('pinCode').isLength({min: 1})
		.trim().withMessage('pinCode must be specified.'),
	body('acceptTerms').isLength({min: 1})
		.trim().withMessage('acceptTerms must be specified.'),
	body('city').isLength({min: 1})
		.trim().withMessage('city must be specified.'),
	body('city').isLength({min: 1})
		.trim().withMessage('city must be specified.'),
	body('city').isLength({min: 1})
		.trim().withMessage('city must be specified.'),
	sanitizeBody('firstname').escape(),
	sanitizeBody('email').escape(),
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

const logInValidator = [
	body('email').isLength({min: 1})
		.trim().withMessage('Email must be specified.')
		.isEmail().withMessage('Email must be a valid email address.'),
	body('password').isLength({min: 1})
		.trim().withMessage('Password must be specified.'),
	body('registerType').isLength({min: 1})
		.trim().withMessage('registerType must be specified.'),
	sanitizeBody('registerType').escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return apiResponses.validationErrorWithData(
				res, 'Please enter valid credentials', errors.array(),
			);
		} else {
			next();
		}
	}];

const emailValidator = [
	body('email').isLength({min: 1})
		.trim().withMessage('email must be specified.')
		.isEmail().withMessage('Email must be a valid email address.'),

	sanitizeBody('email').escape(),
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

	const lawyerLogInValidator = [
		body('email').isLength({min: 1})
			.trim()
			.withMessage('email must be specified.'),
		sanitizeBody('email').escape(),
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponses.validationErrorWithData(
					res, 'Please enter valid credentials', errors.array(),
				);
			} else {
				next();
			}
		}];


const userValidator = {
	signUpValidator: signUpValidator,
	updateValidator: updateValidator,
	logInValidator: logInValidator,
	emailValidator: emailValidator,
	lawyerLogInValidator: lawyerLogInValidator,
};

module.exports = userValidator;
