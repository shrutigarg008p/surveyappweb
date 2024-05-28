const db = require('../models');
const apiResponses = require('../Components/apiresponse');
const User = db.user;


module.exports = {
	checkDuplicateEmail: async (req, res, next) => {
		try {
			const user = await User.findOne({
				where: {
					email: req.body.email,
				},
			});
			if (user) {
				return apiResponses.validationErrorWithData(
					res, 'Failed! email is already in use!',
				);
			}
			next();
		} catch (err) {
			console.error('Error:', err);
			return apiResponses.errorResponse(res, err);
		}
	},

	checkDuplicatePhone: async (req, res, next) => {
		try {
			const user = await User.findOne({
				where: {
					phoneNumber: req.body.phoneNumber,
				},
			});
			if (user) {
				return apiResponses.validationErrorWithData(
					res, 'Failed! phone number is already in use!',
				);
			}
			next();
		} catch (err) {
			console.error('Error:', err);
			return apiResponses.errorResponse(res, err);
		}
	},

	validateEmail: (req, res, next) => {
		User.findOne({
			where: {
				email: req.body.email,
			},
		}).then((user) => {
			if (!user) {
				return apiResponses.validationErrorWithData(
					res, 'Failed! Email does not exists!',
					user,
				);
			}
			next();
		});
	},

	phoneNumberValidationMiddleware: (req, res, next) => {
		const { phoneNumber } = req.body;
		if (phoneNumber && !/^[0-9]+$/.test(phoneNumber)) {
			return apiResponses.validationErrorWithData(
				res, 'Invalid phone number. Only digits are allowed.',
				null,
			);
		}
		next();
	},

	mobileValidationMiddleware: (req, res, next) => {
		const { mobile } = req.body;
		if (mobile && !/^[0-9]+$/.test(mobile)) {
			return apiResponses.validationErrorWithData(
				res, 'Invalid phone number. Only digits are allowed.',
				null,
			);
		}
		next();
	}
};
