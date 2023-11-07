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
};
