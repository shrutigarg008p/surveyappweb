const db = require('../models');
const User = db.user;
const BasicProfile = db.basicProfile;
const Questions = db.questions;
const Profiles = db.profiles;
const Referrals = db.referrals;
const Rewards = db.rewards;
const NotificationsDb = db.notifications;
const ProfileUserResponse = db.profileUserResponse;
const apiResponses = require('../Components/apiresponse');
const {createToken} = require('../Middlewares/userAuthentications');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ip = require('ip');
const Mails = require("../Config/Mails");
const {BOOLEAN, literal} = require("sequelize");
const {bool} = require("twilio/lib/base/serialize");
const {userRegistration} = require("../Config/Mails");
const axios = require("axios");
const {sendVerificationMessage, generateOTP, sendVerificationMessageHindi} = require("../Config/Sms");
const Op = db.Sequelize.Op;


module.exports.registration = async (req, res) => {
	try {
		const language = req.headers['language'] || req.body.language || req.query.language || 'en';
		console.log('body----->', req.body)
		const token = createToken(req.body.email);
		const OTP = generateOTP();
		const user = await User.create({
			email: req.body.email,
			userName: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.password, 8),
			phoneNumber: req.body.phoneNumber,
			registeredDate: new Date().valueOf(),
			createdAt: new Date().valueOf(),
			updatedAt: new Date().valueOf(),
			signupIp: req.ip,
			role: req.body.role || 'panelist',
			registerType: 'password',
			emailConfirmed: false,
			phoneNumberConfirmed: false,
			twoFactorEnabled: false,
			lockoutEnabled: false,
			accessFailedCount: 0,
			securityStamp: token,
			language: req.body.language || 'en',
			activeStatus: 0,
			otp: OTP
		})
		if(language === 'hi') {
			await Mails.userRegistrationHindi(user.email, token);
		} else {
			await Mails.userRegistration(user.email, token);
		}
		// return res.status(200).send({ status:'200', message: "User registered successfully!" , data: userData });
		console.log('successResponseWithData---->', user.email)
		if(req.body.referralId) {
			const isExist = await Referrals.findOne({ where: { email: user.email, userId: req.body.referralId } })
			if(isExist) {
				await Referrals.update(
					{ referredUserId: user.id, referralStatus: "Accepted" },
					{ where: { email: user.email, userId: req.body.referralId }}
				)
			    await Rewards.create({
					points: 200,
					rewardType: 'Referral',
					referralId: user.id,
					rewardStatus: 'Accepted',
					userId: req.body.referralId,
					createdAt: new Date().valueOf(),
					updatedAt: new Date().valueOf(),
					rewardDate: new Date().valueOf(),
				})
			} else {
				await Referrals.create({
					name: 'Unknown',
					email: req.body.email,
					phoneNumber: req.body.phoneNumber,
					referralStatus: "Accepted",
					referralMethod: "Link",
					userId: req.body.referralId,
					referredUserId: user.id,
					createdAt: new Date().valueOf(),
					updatedAt: new Date().valueOf(),
					rewardDate: new Date().valueOf(),
				})
				await Rewards.create({
					points: 200,
					rewardType: 'Referral',
					referralId: user.id,
					rewardStatus: 'Accepted',
					userId: req.body.referralId,
					createdAt: new Date().valueOf(),
					updatedAt: new Date().valueOf(),
					rewardDate: new Date().valueOf(),
				})
			}
		}
		if(language === 'hi') {
			await sendVerificationMessageHindi(OTP, req.body.phoneNumber, 'उपयोगकर्ता')
		} else {
			await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
		}
		return apiResponses.successResponseWithData(
			res,
			'User registered successfully!',
			{email: user.email, userId: user.id, phoneNumber: user.phoneNumber}

		);
	} catch (err) {
		console.log('err---->', err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.continueWithMobile = async (req, res) => {
	try {
		console.log('body----->', req.body)
		const user = await User.findOne({
			where: {
				phoneNumber: req.body.phoneNumber
			},
		})
		const language = req.headers['language'] || req.body.language || req.query.language || 'en';
		if (!user) {
			const token = createToken(req.body.phoneNumber);
			const OTP = generateOTP();
			const user = await User.create({
				email: req.body.email,
				userName: req.body.email,
				phoneNumber: req.body.phoneNumber,
				registeredDate: new Date().valueOf(),
				createdAt: new Date().valueOf(),
				updatedAt: new Date().valueOf(),
				isActive: req.body.isActive,
				signupIp: req.ip,
				role: req.body.role || 'panelist',
				registerType: 'mobile',
				emailConfirmed: true,
				phoneNumberConfirmed: false,
				twoFactorEnabled: false,
				lockoutEnabled: false,
				accessFailedCount: 0,
				securityStamp: token,
				language: req.body.language || 'en',
				activeStatus: 0,
				otp: OTP
			})
			if (req.body.referralId) {
				const isExist = await Referrals.findOne({where: {email: user.email, userId: req.body.referralId}})
				if (isExist) {
					await Referrals.update(
						{referredUserId: user.id, referralStatus: "Accepted"},
						{where: {email: user.email, userId: req.body.referralId}}
					)
					await Rewards.create({
						points: 200,
						rewardType: 'Referral',
						referralId: user.id,
						rewardStatus: 'Accepted',
						userId: req.body.referralId,
						createdAt: new Date().valueOf(),
						updatedAt: new Date().valueOf(),
						rewardDate: new Date().valueOf(),
					})
				} else {
					await Referrals.create({
						name: 'Unknown',
						email: req.body.email,
						phoneNumber: req.body.phoneNumber,
						referralStatus: "Accepted",
						referralMethod: "Link",
						userId: req.body.referralId,
						referredUserId: user.id,
						createdAt: new Date().valueOf(),
						updatedAt: new Date().valueOf(),
						rewardDate: new Date().valueOf(),
					})
					await Rewards.create({
						points: 200,
						rewardType: 'Referral',
						referralId: user.id,
						rewardStatus: 'Accepted',
						userId: req.body.referralId,
						createdAt: new Date().valueOf(),
						updatedAt: new Date().valueOf(),
						rewardDate: new Date().valueOf(),
					})
				}
			}
			if(language === 'hi') {
				await sendVerificationMessageHindi(OTP, req.body.phoneNumber, 'उपयोगकर्ता')
			} else {
				await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
			}
			return apiResponses.successResponseWithData(
				res,
				'User registered successfully!',
				{email: user.email, userId: user.id, phoneNumber: user.phoneNumber, token: token}
			);
		} else {
			const token = createToken(user.id);
			const OTP = generateOTP();
			await User.update({
				otp: OTP,
				token: token,
			}, {where: {id: user.id}})
			if(language === 'hi') {
				await sendVerificationMessageHindi(OTP, req.body.phoneNumber, 'उपयोगकर्ता')
			} else {
				await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
			}
			return apiResponses.successResponseWithData(
				res,
				'User registered successfully!',
				{email: user.email, userId: user.id, phoneNumber: user.phoneNumber, token}
			);
		}
	} catch (err) {
		console.log('err---->', err)
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.resendEmailVerifyMail = async (req, res) => {
	try {
		const token = createToken(req.body.email);
		await User.updateOne({
			securityStamp: token,
		}, { where: { email: req.body.email }})
		await Mails.userRegistration(req.body.email, token);
		return apiResponses.successResponseWithData(
			res,
			'Success!',
		);
	} catch (err) {
		console.log('err---->', err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.resendMobileOtp = async (req, res) => {
	try {
		const language = req.headers['language'] || req.body.language || req.query.language || 'en';
		const OTP = generateOTP();
		const info = await User.update({
			otp: OTP,
		}, { where: { id: req.body.userId, phoneNumber: req.body.phoneNumber }})

		if(info[0] === 1) {
			if(language === 'hi') {
				await sendVerificationMessageHindi(OTP, req.body.phoneNumber, 'उपयोगकर्ता')
			} else {
				await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
			}
			return apiResponses.successResponseWithData(
				res,
				'Success!',
			);
		} else {
			return apiResponses.validationErrorWithData(
				res,
				'User Not Found!',
			);
		}
	} catch (err) {
		console.log('err---->', err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.verifyEmail = async (req, res) => {
	try {
		console.log('re--->', req.query)
		if(req.query.email && req.query.token) {
			const user = await User.findOne({
				where: {
					email: req.query.email,
					securityStamp: req.query.token,
				},
			})
			if (user) {
				await User.update({
					securityStamp: '',
					emailConfirmed: true
				}, {where: {id: user.id}})
				const token = createToken(user.id, user.email, user.role);
				const obj = {
					id: user.id,
					email: user.email,
					phoneNumber: user.phoneNumber,
					registerType: user.registerType,
					role: user.role,
					token: token,
				};
				// return res.status(200).send({ status:'200', message: "Mail Resend successfully!" , data: userData });
				return apiResponses.successResponseWithData(
					res,
					'Success!',
				);
			} else {
				return apiResponses.validationErrorWithData(
					res,
					'email and token must be valid!',
				);
			}
		} else {
			return apiResponses.validationErrorWithData(
				res,
				'email and token must be specified!',
			);
		}
	} catch (err) {
		console.log('err---->', err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.verifyPhone = async (req, res) => {
	try {
		console.log('re--->', req.query)
		if(req.body.userId && req.body.otp) {
			const user = await User.findOne({
				where: {
					id: req.body.userId,
					otp: req.body.otp
				},
			})
			if (user) {
				await User.update({
					otp: null,
					phoneNumberConfirmed: true
				}, {where: {id: user.id}})

				const verifyUser = await User.findOne({
					where: {
						id: req.body.userId
					},
				})
				const isExist = await BasicProfile.findOne({where: {userId: user.id}})
				const obj = {
					id: user.id,
					emailConfirmed: user.emailConfirmed,
					basicProfile: isExist,
					role: user.role,
					phoneNumberConfirmed: verifyUser.phoneNumberConfirmed,
					phoneNumber: verifyUser.phoneNumber,
					language: verifyUser.language
				};
				return apiResponses.successResponseWithData(
					res,
					'Success!',
					obj

				);
			} else {
				return apiResponses.validationErrorWithData(
					res,
					'OTP must be valid!',
				);
			}
		} else {
			return apiResponses.validationErrorWithData(
				res,
				'Otp must be specified!',
			);
		}
	} catch (err) {
		console.log('err---->', err)
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.userLogin = async (req, res) => {
	try {
		const language = req.headers['language'] || req.body.language || req.query.language || 'en';
		if (req.body.registerType === 'password') {
			const user = await User.findOne({
				where: {
					email: req.body.email,
					registerType: req.body.registerType,
				},
			})
			if (!user) {
				return apiResponses.notFoundResponse(res, 'User Not found.', {});
			}

			const passwordIsValid = bcrypt.compareSync(
				req.body.password,
				user.passwordHash,
			);

			if (!passwordIsValid) {
				return apiResponses.unauthorizedResponse(
					res,
					'Invalid Password!',
					null,
				);
			}
			if (user.deletedAt || user.deleteConfirmDate) {
				return apiResponses.unauthorizedResponse(
					res,
					'User not available',
					null,
				);
			}


			const isExist = await BasicProfile.findOne({where: {userId: user.id}})
			const OTP = generateOTP();
			if(user.phoneNumberConfirmed === false) {
				if(language === 'hi') {
					await sendVerificationMessageHindi(OTP, user.phoneNumber, 'उपयोगकर्ता')
				} else {
					await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
				}
				await User.update({signupIp: req.ip, otp: OTP}, {where: {id: user.id}})
			} else {
				await User.update({signupIp: req.ip}, {where: {id: user.id}})
			}
			const token = createToken(user.id, user.email, user.role);
			const obj = {
				id: user.id,
				email: user.email,
				phoneNumber: user.phoneNumber,
				registerType: user.registerType,
				role: user.role,
				emailConfirmed: user.emailConfirmed,
				phoneNumberConfirmed: user.phoneNumberConfirmed,
				token: token,
				basicProfile: isExist,
				language: user.language
			};
			return apiResponses.successResponseWithData(
				res,
				'Successfully login',
				obj,
			);
		} else if (req.body.registerType === 'facebook') {
			User.findOne({
				where: {
					facebooktoken: req.body.facebooktoken,
					registerType: req.body.registerType,
				},
			}).then(async (user) => {
				if (!user) {
					let OTP = null
					if(req.body.phoneNumber){
						OTP = generateOTP();
					}
					console.log('req---->', req.body)
					const userInfo = await User.create({
						email: req.body.email || null,
						userName: req.body.email || null,
						facebooktoken: req.body.facebooktoken,
						phoneNumber: req.body.phoneNumber || null,
						registeredDate: new Date().valueOf(),
						createdAt: new Date().valueOf(),
						updatedAt: new Date().valueOf(),
						signupIp: req.ip,
						role: req.body.role || 'panelist',
						registerType: req.body.registerType,
						emailConfirmed: false,
						phoneNumberConfirmed: false,
						twoFactorEnabled: false,
						lockoutEnabled: false,
						accessFailedCount: 0,
						language: req.body.language || 'en',
						activeStatus: 0,
						otp: OTP
					})
					const token = createToken(userInfo.id);
					const isExist = await BasicProfile.findOne({where: {userId: userInfo.id}})
					const obj = {
						id: userInfo.id,
						email: userInfo.email,
						phoneNumber: userInfo.phoneNumber,
						registerType: userInfo.registerType,
						role: userInfo.role,
						emailConfirmed: userInfo.emailConfirmed,
						phoneNumberConfirmed: userInfo.phoneNumberConfirmed,
						token: token,
						language: userInfo.language,
						basicProfile: isExist
					};
					return apiResponses.successResponseWithData(
						res,
						'Success!',
						obj
					);
				} else {
					const isExist = await BasicProfile.findOne({where: {userId: user.id}})
					const token = createToken(user.id, user.email, user.role);
					const obj = {
						id: user.id,
						email: user.email,
						phoneNumber: user.phoneNumber,
						registerType: user.registerType,
						role: user.role,
						emailConfirmed: user.emailConfirmed,
						phoneNumberConfirmed: user.phoneNumberConfirmed,
						token: token,
						language: user.language,
						basicProfile: isExist
					};
					return apiResponses.successResponseWithData(
						res,
						'Successfully login',
						obj,
					);
				}
			}).catch((error) => {
				console.error('Error:--->', error);
				return apiResponses.errorResponse(res, 'An error occurred in the promise chain');

			})
		} else if (req.body.registerType === 'gmail') {
			User.findOne({
				where: {
					email: req.body.email,
					registerType: req.body.registerType,
				},
			}).then(async (user) => {
				if (!user) {
					const token = createToken(req.body.email);
					let OTP = null
					if(req.body.phoneNumber){
						OTP = generateOTP();
					}
					const user = await User.create({
						email: req.body.email,
						userName: req.body.email,
						phoneNumber: req.body.phoneNumber,
						registeredDate: new Date().valueOf(),
						createdAt: new Date().valueOf(),
						updatedAt: new Date().valueOf(),
						signupIp: req.ip,
						role: req.body.role || 'panelist',
						registerType: req.body.registerType,
						emailConfirmed: false,
						phoneNumberConfirmed: false,
						twoFactorEnabled: false,
						lockoutEnabled: false,
						accessFailedCount: 0,
						securityStamp: token,
						language: req.body.language || 'en',
						activeStatus: 0,
						otp: OTP
					})
					// await Mails.userRegistration(user.email, token);
					const isExist = await BasicProfile.findOne({where: {userId: user.id}})
					const obj = {
						id: user.id,
						email: user.email,
						phoneNumber: user.phoneNumber,
						registerType: user.registerType,
						role: user.role,
						emailConfirmed: user.emailConfirmed,
						phoneNumberConfirmed: user.phoneNumberConfirmed,
						token: token,
						language: user.language,
						basicProfile: isExist
					};
						return apiResponses.successResponseWithData(
							res,
							'Success!',
							obj
						);
				} else {
					const isExist = await BasicProfile.findOne({where: {userId: user.id}})
					const token = createToken(user.id, user.email, user.role);
					const obj = {
						id: user.id,
						email: user.email,
						phoneNumber: user.phoneNumber,
						registerType: user.registerType,
						role: user.role,
						emailConfirmed: user.emailConfirmed,
						phoneNumberConfirmed: user.phoneNumberConfirmed,
						token: token,
						language: user.language,
						basicProfile: isExist
					};
					return apiResponses.successResponseWithData(
						res,
						'Successfully login',
						obj,
					);
				}
			}).catch((error) => {
				console.error('Error:--->', error);
				return apiResponses.errorResponse(res, 'An error occurred in the promise chain');

			})
		}
	} catch (err){
		console.log('err--->', err)
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.userUpdate = async (req, res) => {
	try {
		const language = req.headers['language'] || req.body.language || req.query.language || 'en';
		let obj = {
			userId: req.params.userId,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			gender: req.body.gender,
			dateOfBirth: req.body.dateOfBirth,
			referralSource: req.body.referralSource,
			addressLine1: req.body.addressLine1,
			addressLine2: req.body.addressLine2,
			country: req.body.country,
			state: req.body.state,
			city: req.body.city,
			pinCode: req.body.pinCode,
			acceptTerms: Boolean(req.body.acceptTerms),
			createdAt: new Date().valueOf(),
			updatedAt: new Date().valueOf(),
			mobile: req.body.mobile,
			registrationIp: req.ip,
			imagePath: req.body.imagePath
		}

		console.log('re---->', obj, req.params)
		const isExist = await BasicProfile.findOne({ where: { userId: req.params.userId } })
		if(!isExist) {
			const user = await BasicProfile.create(
				obj
			)

			await Referrals.update(
				{ name: `${req.body.firstName} ${req.body.lastName}` },
				{ where: { referredUserId: req.params.userId }}
			)
			User.hasOne(BasicProfile, {
				foreignKey: 'userId',
			});
			const userInfo = await User.findOne({
				where: {
					id: req.params.userId
				},
				include: [{
					model: BasicProfile,
					required: false,
				}],
			})
			return apiResponses.successResponseWithData(res, 'Success Created', userInfo);
		} else {
			delete obj.userId
			const existUser = await User.findOne({where: {id: req.params.userId}})
			obj.mobile = existUser.phoneNumber || isExist.mobile
			obj.email = existUser.email || isExist.email
			const user = await BasicProfile.update(
				obj, {where: {userId: req.params.userId}}
			)
			if (req.body.email) {
				if (existUser.email === req.body.email) {
					const user = await BasicProfile.update(
						{email: req.body.email}, {where: {userId: req.params.userId}}
					)
					await User.update(
						{email: req.body.email}, {where: {id: req.params.userId}}
					)
				} else {
					const isMailExist = await User.findOne({
						where: {
							email: req.body.email,
							registerType: existUser.registerType,
							deletedAt: null
						}
					})
					if (!isMailExist) {
						const token = createToken(req.body.email);
						const user = await BasicProfile.update(
							{email: req.body.email}, {where: {userId: req.params.userId}}
						)
						await User.update(
							{
								email: req.body.email,
								emailConfirmed: false,
								securityStamp: token,
							}, {where: {id: req.params.userId}}
						)
						if (language === 'hi') {
							await Mails.userEmailChangedHindi(req.body.email, token);
						} else {
							await Mails.userEmailChanged(req.body.email, token);
						}
					}
				}
			}

			if (req.body.mobile) {
				if (existUser.phoneNumber === req.body.mobile) {
					const user = await BasicProfile.update(
						{mobile: req.body.mobile}, {where: {userId: req.params.userId}}
					)
					await User.update(
						{phoneNumber: req.body.mobile}, {where: {id: req.params.userId}}
					)
				} else {
					const isMobileExist = await User.findOne({
						where: {
							phoneNumber: req.body.mobile,
							registerType: existUser.registerType,
							deletedAt: null
						}
					})
					if (!isMobileExist) {
						const OTP = generateOTP();
						const user = await BasicProfile.update(
							{mobile: req.body.mobile}, {where: {userId: req.params.userId}}
						)
						await User.update(
							{
								phoneNumber: req.body.mobile,
								otp: OTP,
								phoneNumberConfirmed: false,
							}, {where: {id: req.params.userId}}
						)
						// if(req.query.language === 'hi') {
						// 	await sendVerificationMessageHindi(OTP, req.body.mobile, 'उपयोगकर्ता')
						// } else {
						// 	await sendVerificationMessage(OTP, req.body.mobile, 'User')
						// }
					}
				}

				User.hasOne(BasicProfile, {
					foreignKey: 'userId',
				});
				const userInfo = await User.findOne({
					where: {
						id: req.params.userId
					},
					attributes: {
						exclude: ['otp'],
					},
					include: [{
						model: BasicProfile,
						required: false,
					}],
				})
				return apiResponses.successResponseWithData(res, 'Success Update', userInfo);
			}

			const userInfo = await User.findOne({
				where: {
					id: req.params.userId
				},
				include: [{
					model: BasicProfile,
					required: false,
				}],
			})
			return apiResponses.successResponseWithData(res, 'Success Update', userInfo);
		}
	} catch (err) {
		console.log('errrr----->', err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.updateUserLanguage = async (req, res) => {
	try {
		let obj = {
			language: req.body.language || 'en',
		}

		const isExist = await User.findOne({ where: { id: req.params.userId } })
		if(isExist) {
			const user = await User.update(
				obj, { where: { id: req.params.userId } }
			)
			User.hasOne(BasicProfile, {
				foreignKey: 'userId',
			});
			const userInfo = await User.findOne({
				where: {
					id: req.params.userId
				},
				include: [{
					model: BasicProfile,
					required: false,
				}],
			})
			return apiResponses.successResponseWithData(res, 'Success Update', userInfo);

		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.unSubscribeUser = async (req, res) => {
	try {
		const isExist = await User.findOne({ where: { id: req.params.userId } })
		console.log('isExist--->', isExist)
		if(isExist) {
			if(isExist.unsubscribeDate) {
				let obj = {
					unsubscribeDate: null,
					unsubscribeRequestDate: null,
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, { where: { id: req.params.userId } }
				)
			} else {
				let obj = {
					unsubscribeDate: new Date().valueOf(),
					unsubscribeRequestDate: new Date().valueOf(),
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			}
			return apiResponses.successResponseWithData(res, 'Success');
		} else {
			return apiResponses.validationErrorWithData(res, 'User not found', null);
		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.updateDeviceToken = async (req, res) => {
	try {
		const isExist = await User.findOne({ where: { id: req.body.userId } })
		if(isExist) {
				let obj = {
					devicetoken: req.body.devicetoken,
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, { where: { id: req.body.userId } }
				)
			return apiResponses.successResponseWithData(res, 'Success');
		} else {
			return apiResponses.validationErrorWithData(res, 'User not found', null);
		}
	} catch (err) {
		console.log('isExist--->', err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.users = async (req, res) => {
	try {
		const limit = req.params.limit;
		User.findAll({limit: limit, order: [['createdAt', 'DESC']]}).then(
			async (result) => {
				/* #swagger.responses[404] = {
                       description: "Email Not found.",
                       schema: { $statusCode: "404",  $status: false, $message: "User Not found.",  $data: {}}
                   } */
				// return res.status(404).send({ message: "User Not found." });

				return apiResponses.successResponseWithData(res, 'success!', result);
			},
		);
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.getUser = async (req, res) => {
	try {
		const user = await User.findOne({where: {id: req.params.id}})
		const profile = await BasicProfile.findOne({where: {userId: req.params.id}})
			/* #swagger.responses[404] = {
                       description: "Email Not found.",
                       schema: { $statusCode: "404",  $status: false, $message: "User Not found.",  $data: {}}
                   } */
			// return res.status(404).send({ message: "User Not found." });


			return apiResponses.successResponseWithData(res, 'success!', {...user, profile});
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.userPasswordReset = async (req, res) => {
	try {
		const language = req.headers['language'] || req.query.language || 'en';
		User.findOne(
			{where: {email: req.body.email},
			})
			.then((user) => {
				if (!user) {
					return apiResponses.successResponseWithData(res, 'User with this email does not exists.');
				}
				crypto.randomBytes(32, async (err, buffer)=>{
					if (err) {
						console.log(err);
					}
					const token = buffer.toString('hex');
					User.update(
						{
							legacyPassword: token,
							// expireToken: Date.now() + 3600000,
						},
						{
							where: {email: req.body.email},
						},
					).then((user) => {
						if (!user) {
							return apiResponses.notFoundResponse(res, 'Not found.', {});
						}
					});

					console.log('eset-password--->', language)
					if(language === 'hi'){
						await Mails.userPasswordResetHindi(user.email, token);
					} else {
						await Mails.userPasswordReset(user.email, token);
					}
				});
				return apiResponses.successResponseWithData(res, 'Link send to your email ');
			});
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.updateNewPassword = async (req, res) => {
	const sentToken = req.params.token;
	try {
		User.update({
				passwordHash: await bcrypt.hashSync(req.body.password, 8),
				legacyPassword: null,
				// expireToken: null,
			},
			{where: {
					legacyPassword: sentToken,
					// expireToken: {[Op.gt]: Date.now()}
				},
			})
			.then(async (user) => {
				if (user[0] === 0) {
					return apiResponses.notFoundResponse(res, 'Not found.', {});
				}
				return apiResponses.successResponseWithData(res, 'Success', user);
			})
			.catch((error) => {
				return apiResponses.errorResponse(res, error.message, {});
			});
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.changePassword = async (req, res) => {
	try {
		const userId = req.body.userId;
		const oldPassword = req.body.currentPassword;
		const newPassword = req.body.newPassword;

		// Fetch the user based on userId
		const user = await User.findOne({ where: { id: userId } });

		if (!user) {
			return apiResponses.validationErrorWithData(res, 'User not found.', {});
		}

		// Compare the old password with the stored hashed password
		const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);

		if (!passwordMatch) {
			return apiResponses.unauthorizedResponse(res, 'Incorrect old password.', {});
		}

		// Update the password with the new one
		const updatedUser = await user.update({
			passwordHash: await bcrypt.hashSync(newPassword, 8),
		});

		return apiResponses.successResponseWithData(res, 'Password updated successfully.', updatedUser);
	} catch (err) {
		return apiResponses.errorResponse(res, err.message, {});
	}
};


module.exports.temporaryDelete = async (req, res) => {
	try {
		const isExist = await User.findOne({ where: { id: req.params.userId } })
		if(isExist) {
			if (isExist.deletedAt) {
				let obj = {
					deletedAt: null,
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			} else {
				let obj = {
					deletedAt: new Date().valueOf(),
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			}
			return apiResponses.successResponseWithData(res, 'Success');
		} else {
			return apiResponses.validationErrorWithData(res, 'User not found', null);
		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.permanentlyDelete = async (req, res) => {
	try {
		const isExist = await User.findOne({ where: { id: req.params.userId } })
		if(isExist) {
			if(req.params.type === 'admin') {
				let obj = {
					deleteRequestDate: new Date().valueOf(),
					deleteConfirmDate: new Date().valueOf(),
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			} else {
				let obj = {
					deleteRequestDate: new Date().valueOf(),
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			}
			return apiResponses.successResponseWithData(res, 'Success');
		} else {
			return apiResponses.validationErrorWithData(res, 'User not found', null);
		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.deleteActions = async (req, res) => {
	try {
		const isExist = await User.findOne({ where: { id: req.params.userId } })
		if(isExist) {
			if(req.params.action === 'accept') {
				let obj = {
					deleteConfirmDate: new Date().valueOf(),
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			} else {
				let obj = {
					deleteRequestDate: null,
					updatedAt: new Date().valueOf()
				}
				const user = await User.update(
					obj, {where: {id: req.params.userId}}
				)
			}
			return apiResponses.successResponseWithData(res, 'Success');
		} else {
			return apiResponses.validationErrorWithData(res, 'User not found', null);
		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.basicProfileOnly = async (req, res) => {
	try {
		User.hasOne(BasicProfile, {
			foreignKey: 'userId',
		});
		const limit = req.params.limit;
		User.findAll({
			attributes: ['phoneNumber', 'id', 'email', 'createdAt'],
			include: [{
				model: BasicProfile,
				attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
				required: false,
			}],
		limit: limit,
		order: [['createdAt', 'DESC']]
		}).then(
			async (result) => {
				let data = []
				if(req.params.type === 'registeredOnly') {
					data = result.filter(item => item.basic_profile === null);
				} else if(req.params.type === 'basicProfileOnly') {
					data = result.filter(item => item.basic_profile !== null);
				} else if(req.params.type === 'unsubscribedRequestOnly') {
					data = await User.findAll({
						where: { unsubscribeRequestDate: { $ne: null }},
						attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'unsubscribeRequestDate'],
						include: [{
							model: BasicProfile,
							attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
							required: false,
						}],
						limit: limit,
						order: [['createdAt', 'DESC']]
					})
				} else if(req.params.type === 'deleteRequestOnly') {
					data = await User.findAll({
						where: {
							deleteRequestDate: {
								[Sequelize.Op.ne]: null,
							},
						},
						attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'deleteRequestDate', 'deleteConfirmDate'],
						include: [{
							model: BasicProfile,
							attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
							required: false,
						}],
						limit: limit,
						order: [['createdAt', 'DESC']]
					})
				} else if(req.params.type === 'bouncedOnly') {
					data = await User.findAll({
						attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'deleteRequestDate'],
						include: [{
							model: BasicProfile,
							attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
							required: false,
						}],
						limit: limit,
						order: [['createdAt', 'DESC']]
					})
				} else {
					data = await User.findAll({
						where: { deleteRequestDate: { $ne: null }},
						attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'deleteRequestDate'],
						include: [{
							model: BasicProfile,
							attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
							required: false,
						}],
						limit: limit,
						order: [['createdAt', 'DESC']]
					})
				}
				return apiResponses.successResponseWithData(res, 'success!', data);
			},
		);
	} catch (err) {
		console.log(err)
		return apiResponses.errorResponse(res, err);
	}
};




module.exports.allPanelists = async (req, res) => {
	try {
		User.hasOne(BasicProfile, {
			foreignKey: 'userId',
		});
		const limit = req.params.limit;
		let whereClauseProfile = {};
		let whereClauseUser = {};
		let filteredProfilePanelists = []
		let filteredUserPanelists = []
		const request = req.body
		if(request.gender || request.startAge && request.endAge || request.states && request.states.length > 0
		|| request.cities && request.cities.length > 0 ) {
			if (request.gender) {
				whereClauseProfile.gender = request.gender;
			}

			if (request.startAge && request.endAge) {
				whereClauseProfile.dateOfBirth = literal(
					`TIMESTAMPDIFF(YEAR, basicProfile.dateOfBirth, CURDATE()) BETWEEN ${request.startAge} AND ${request.endAge}`
				);
			}

			if (request.states && request.states.length > 0) {
				whereClauseProfile.stateId = {
					[Op.in]: request.states,
				};
			}

			if (request.cities && request.cities.length > 0) {
				whereClauseProfile.cityId= {
					[Op.in]: request.cities,
				};
			}

			if (request.tiers && request.tiers.length > 0) {
				whereClauseProfile.tier = {
					[Op.in]: request.tiers,
				};
			}

			filteredProfilePanelists = await BasicProfile.findAll({
				where: whereClauseProfile,
				limit: limit,
				order: [['createdAt', 'DESC']]
			});
		}
			if (request.id) {
				whereClauseUser.id = request.id;
			}
			if (request.email) {
				whereClauseUser.email = request.email;
			}

			if (request.phoneNumber) {
				whereClauseUser.phoneNumber = request.phoneNumber;
			}

			if (request.isActive) {
				whereClauseUser.activeStatus = request.isActive === 'active' ? 0 : 1;
			}

			if (request.fromRegistrationDate && request.toRegistrationDate) {
				whereClauseUser.registrationDate = {
					[Op.between]: [request.fromRegistrationDate, request.toRegistrationDate],
				};
			}

			if (request.surveys && request.surveys.length > 0) {
				whereClauseUser.surveyId = {
					[Op.in]: request.surveys,
				};
			}

			if (request.sec && request.sec.length > 0) {
				whereClauseUser.secId = {
					[Op.in]: request.sec,
				};
			}

			console.log('whereClause--->', whereClauseUser, whereClauseProfile)
		    filteredUserPanelists = await User.findAll({
				where: whereClauseUser,
				attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'deleteRequestDate', 'activeStatus'],
				include: [
					{
						model: BasicProfile,
						attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName', 'gender', 'mobile', 'state'],
						required: false
					},
				],
				limit: limit,
				order: [['createdAt', 'DESC']]
			});

			let mergedArray = []
			if(filteredProfilePanelists.length > filteredUserPanelists.length) {
				mergedArray = filteredProfilePanelists.map(user => {
					const matchingPanelist = filteredUserPanelists.find(panelist => panelist.id === user.userId);
					return {
						"userId": user.userId || matchingPanelist.id,
						"isActive": matchingPanelist.activeStatus,
						"firstName": user.firstName || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.firstName : '',
						"lastName": user.lastName || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.lastName : '',
						"gender": user.gender || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.gender : '',
						"mobile": matchingPanelist ? matchingPanelist.phoneNumber : user ? user.mobile : '',
						"email": user.email || matchingPanelist ? matchingPanelist.email : '',
						"dateOfBirth": user.dateOfBirth || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.dateOfBirth : '',
						"city": user.city || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.city : '',

					}
				});
			} else {
				mergedArray = filteredUserPanelists.map(user => {
					const matchingPanelist = filteredProfilePanelists.find(panelist => panelist.userId === user.id);
					return {
						"userId": user.id || matchingPanelist.userId,
						"isActive": user.activeStatus,
						"firstName": matchingPanelist ? matchingPanelist.firstName : user.basic_profile ? user.basic_profile.firstName : '',
						"lastName": matchingPanelist ? matchingPanelist.lastName : user.basic_profile ? user.basic_profile.lastName : '',
						"gender": matchingPanelist ? matchingPanelist.gender : user.basic_profile ? user.basic_profile.gender : '',
						"mobile": user.phoneNumber,
						"email": user.email || '',
						"dateOfBirth": matchingPanelist ? matchingPanelist.dateOfBirth : user.basic_profile ? user.basic_profile.dateOfBirth : '',
						"city": matchingPanelist ? matchingPanelist.city : user.basic_profile ? user.basic_profile.city : '',
					}
				});
			}
		return apiResponses.successResponseWithData(res, 'success!',  filteredUserPanelists);
	} catch (err) {
		console.log(err)
		return apiResponses.errorResponse(res, err);
	}
};



module.exports.panelistProfile = async (req, res) => {
	try {
		User.hasOne(BasicProfile, {
			foreignKey: 'userId',
		});
		const limit = req.params.limit;
		User.findOne({
			where: {id: req.params.id},
			attributes: ['phoneNumber', 'id', 'email', 'createdAt'],
			include: [{
				model: BasicProfile,
				attributes: [
					'firstName',
					'lastName',
					'dateOfBirth',
					'city',
					'firstName',
					'lastName',
					'gender',
					'addressLine1',
					'addressLine2',
					'country',
					'pinCode',
					'imagePath',
					'referralSource'

				],
				required: false,
			}]
		}).then(
			async (result) => {
				if(result){
				result = {
					...result.toJSON(),
					profilesTotalPercentage: 0,
					profile: {
						about: 0,
						personalFinance: 0,
						shopping: 0,
						travel: 0,
						media: 0,
						houseHold: 0,
						health: 0,
						professional: 0,
						Electronics: 0,
					},
					surveys: {
						totalCount: 0,
						completedCount: 0,
						inCompletedCount: 0,
						notStartedCount: 0,
						list: []
					},
					rewards: {
						totalCount: 0,
						completedCount: 0,
						inCompletedCount: 0,
						notStartedCount: 0,
						list: []
					},
					referrals: {
						totalCount: 0,
						completedCount: 0,
						inCompletedCount: 0,
						notStartedCount: 0,
						list: []
					},
					redemption: {
						totalCount: 0,
						completedCount: 0,
						inCompletedCount: 0,
						notStartedCount: 0,
						list: []
					}
				}
				return apiResponses.successResponseWithData(res, 'success!', result);
			} else {
					return apiResponses.validationErrorWithData(res, 'User Not found!', null);
				}
			}
		)
	   .catch((err) => {
		   return apiResponses.validationErrorWithData(res, 'Something went wrong!', null);
	   });
	} catch (err) {
		console.log(err)
		return apiResponses.errorResponse(res, err);
	}
};


const Sequelize = db.Sequelize;
module.exports.respondentProfileOverview = async (req, res) => {
	try {
		const language = req.headers['language'] || req.query.language || 'en';
		db.profiles.hasMany(db.questions, { foreignKey: 'profileId' });
		db.questions.belongsTo(db.profiles, { foreignKey: 'profileId' });
		db.profiles.hasMany(ProfileUserResponse, { foreignKey: 'profileId' });
		const profilesWithQuestionsCount = await Profiles.findAll({
			where: { deletedAt: null },
			attributes: {
				include: [
					[Sequelize.literal('(SELECT COUNT(*) FROM questions WHERE questions."profileId" = profiles.id AND questions."deletedAt" IS NULL AND questions."isActive" = true)'), 'questionCount']
				]
			},
			include: [
				{
					model: ProfileUserResponse,
					where: { userId: req.params.id },
					attributes: ['id', "response"],
					required: false
				}
			],
			raw: true
		})
		const basicProfile = await BasicProfile.findOne({ where: { userId: req.params.id }})
		const users = await User.findOne({ where: { id: req.params.id }, attributes: ['emailConfirmed', 'unsubscribeDate', 'id', 'deleteRequestDate', 'phoneNumber', "email", "phoneNumberConfirmed"]})
		let resultIn = profilesWithQuestionsCount.map(section => {
			const totalQuestions = parseInt(section.questionCount);
			const response = section['profileuserresponses.response'];
			if (response && Object.keys(response).length > 0) {
				const attemptedQuestions = Object.keys(response).length;
				const remainingQuestions = totalQuestions - attemptedQuestions;
				const attemptedPercentage = Math.round((attemptedQuestions / totalQuestions) * 100);
				delete section['profileuserresponses.response'];
				delete section['profileuserresponses.id'];
				return {
					...section,
					totalQuestions,
					attemptedQuestions,
					remainingQuestions,
					attemptedPercentage
				};
			} else {
				return {
					...section,
					totalQuestions,
					attemptedQuestions: 0,
					remainingQuestions: totalQuestions,
					attemptedPercentage: 0
				};
			}
		});
		const overallTotalQuestions = resultIn.reduce((total, section) => total + section.totalQuestions, 0);
		const overallAttemptedQuestions = resultIn.reduce((total, section) => total + section.attemptedQuestions, 0);
		const overallAttemptedPercentage = Math.round((overallAttemptedQuestions / overallTotalQuestions) * 100);
		if(overallAttemptedPercentage === 100) {
			console.log('Yes')
			const isExist = await Rewards.findOne({where: {userId: req.params.id, rewardType: 'Profile Completed'}})
			if (!isExist) {
				await Rewards.create({
					points: 50,
					rewardType: 'Profile Completed',
					rewardStatus: 'Accepted',
					userId: req.params.id,
					createdAt: new Date().valueOf(),
					updatedAt: new Date().valueOf(),
					rewardDate: new Date().valueOf(),
				})
			}
		}

		const result = resultIn.map(profile => ({
			...profile,
			name: language === 'hi' ? profile.hindi : profile.name,
		}))
		return apiResponses.successResponseWithData(res, 'success!', {result, overallAttemptedPercentage, basicProfile, users});
	} catch (err) {
		console.log(err)
		return apiResponses.errorResponse(res, err);
	}
};


module.exports.userNotifications = async (req, res) => {
	try {
		const notificationsList = await NotificationsDb.findAll({ where: { userId: req.params.userId } })
		return apiResponses.successResponseWithData(res, 'Success', notificationsList);
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.uploadUserProfile = async (req, res) => {
	try {
		if (req.file && req.body.userId) {
			const imagePath = '/Images/' + req.file.filename;
			await BasicProfile.update({
				imagePath: imagePath,
			}, { where: { userId: req.body.userId }})
			return apiResponses.successResponseWithData(res, 'Success', imagePath);
		} else {
			return apiResponses.validationErrorWithData(res, 'No file uploaded');
		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};


//Delete Users Script

const applicationAssignUser = db.applicationAssignUser;
const asssignSurveys = db.asssignSurveys;
const messages = db.messages;
const notifications = db.notifications;
const partnerUsers = db.partnerUsers;
const profileUserResponse = db.profileUserResponse;
const redemptionRequest = db.redemptionRequest;
const referrals = db.referrals;
const rewards = db.rewards;

const blacklistedSurveys = db.blacklistedSurveys;
const surveyEmailSchedule = db.surveyEmailSchedule;
const surveyPartners = db.surveyPartners;
const surveys = db.surveys;
const surveyTemplates = db.surveyTemplates;



const userIds = [
	"d692948f-8e5c-4641-ad7b-3291a934a72c",
	"eac0ef8c-8226-401d-8c7e-d5f40a7ef045",
	"6f95edeb-c840-4735-9941-ff106e6fcaec",
	"745808fd-0cd3-4769-9b1c-d3db71bfce3a",
	"005b14a7-acab-4966-b9f0-2d694d6cf1bc",
	"707d3790-448f-4f88-83af-4d3a3886f3c5",
	"36caf00e-b156-440a-8f34-359712e40621",
	"641254de-4b84-4a52-9d38-3ae5c44836cd",
	"ed828eba-037c-43dc-b448-9e05175a686a",
	"4499ef5e-be91-4622-9437-1891096eda37",
	"0506c043-45b0-45a6-bca1-676d49489c63",
	"ebcca7d5-1a38-4cf3-8010-4e6acece9038",
	"a53cde2b-8873-4a0b-99b0-637a16889287",
	"54cad0d5-0f94-4e43-ba66-633c63e225ed",
	"3023d32d-0583-43ba-bcd5-67a60024416b",
	"222641c9-441e-4dde-95ca-0601d7b0b5dd",
	"069cbacf-1fd5-4440-9056-eedeaf0f2cab",
	"31afe415-dc7f-4457-9ae8-e5549c35ea1c",
	"2e25eac6-d458-4cd9-a0e8-5121d2b506d0",
	"f75b8660-9368-467c-a3d2-ca36b9d68329",
	"87b7b34e-ebea-4cda-baf0-f63c6e7d3714",
	"e15ac91b-67db-480e-9f39-2ef4aa9f1fbb",
	"480e42fc-ba01-4270-be6e-1c0dee6b8773",
	"afe9d4d6-8fa7-4609-b4fe-114aae26f930",
	"74426aab-d370-48a1-aa55-c47ae2c0bae0",
	"089a9ca6-3ecf-4c93-9938-c43fcf6be00f",
	"4cb3923a-c1f0-429c-b1e7-bb0ba50b20d8",
	"e997360b-2c89-4c19-8de9-c81142b39ce9",
	"1f4c1e11-aa9a-4925-b842-4b5208ab8004",
	"a4e6a5a6-0d1c-48c9-a49d-1fe8b0cc4963",
	"3a0d6c43-efc6-4f58-9c9a-0525fe858e20",
	"e7bd53d6-ca64-4727-b84e-f97f1ad3c804",
	"68699612-de98-440b-aeea-d54e70128f45",
	"dcd6b75b-3b7e-4c49-b655-47e78ff57288",
	"a46d1ad6-7f5a-4f06-9871-451a8d5aaa38",
	"e3e5e4fc-6a0a-49da-b6dc-91cb523f814b",
	"b913e328-baeb-4cf7-be46-e0c2add140bf",
	"a2029691-dd7c-457c-b7f4-227cc2b20be3",
	"bb29075d-623e-49ea-83d3-fb375290fc44",
	"02e2eca0-f4a0-4ea4-ad9d-431a61379dda",
	"35a0e774-ea33-4d9b-b74c-617b0aaa29ea",
	"81e05538-ac48-4c26-bb15-39cea3186e02",
	"321d77ae-1992-46c2-8cad-54d47cc2fb6a",
	"40c6c8df-6191-4524-9fe6-5e8fc8fd333a",
	"50ce1dae-b4f1-4f91-a3f0-c8823ba794fd",
	"9b381cc6-3fde-4ca1-bebe-6815bcdfc3ae",
	"b48d8b85-161c-40b7-9f60-2a9fbca0bada",
	"8105779c-4f6d-4ec9-b5ad-e1ff4b1661df",
	"f280172b-fca0-4258-83ad-ceec8a1eb3a7",
	"a59bece2-4615-48c7-b6ea-81899259ce51",
	"2ac1383a-f73a-4991-8a1e-480afea06029",
	"535af817-6f99-4ff2-b023-354e5cf22e36",
	"924a6894-aed7-4ede-b665-e789d8123a96",
	"2c63dbf2-7084-4bac-a99a-429bc6196398",
	"4d6f2c46-7899-4443-8e1f-a5a44798199e",
	"a6abacfb-6bb9-48a9-838f-58aaf9f293d8",
	"d16e9ff7-e159-41f2-9419-1dcc8f9c453f",
	"15b7b5de-f9a2-4665-841a-38fe7febc2de",
	"f6cca0c5-fdbb-4baa-8ad5-470c3d2e8f6f",
	"97e50e0a-e4c8-43bb-b1ff-24324a711804",
	"ad5ebd4b-3134-4ab4-b540-25e0930e2169",
	"02d9d8ee-a283-4eac-80b7-c058fcf20e70",
	"cde22d1b-b010-4e52-a549-efbb71111aa7",
	"ba452f9b-d05d-43b2-9ee6-6d9e74dcf0bd",
	"04de8ede-d31e-459b-857a-2201aea64c20",
	"0b823adc-a7a3-4115-811e-84cdcc2f7b21",
	"c99ed2dc-4f6d-4800-af0b-3330d81d48cc",
	"c812cced-1d32-4a03-82ce-d783edfb4e24",
	"0c7d2750-0ada-4c80-990e-8d85b29c6c18",
	"fbec8278-0084-4b8f-acc7-4646d0d9f758",
	"586ac4b5-dfe7-42e2-a3a9-8df6a3f2da27",
	"b95360b1-a164-456b-93fc-9237251b9528",
	"3fac8b25-8fb7-4a82-96c8-c6c873dc405a",
	"d396c490-4993-476e-8e1c-8f19d964e060",
	"7f6c27c8-7e17-4ca7-adfd-f54dbd1e52e5",
	"38a71c47-92a6-4f63-acc6-c6f3ce098259",
	"c8479731-1dc8-4666-a41c-3cf88477e039",
	"263f5156-1d24-4a04-afde-33acdf1b0d9e",
	"b23ab4cf-e2d0-466f-b213-b6fd1665bd83",
	"00c2aa17-c359-4935-95cc-f300d11fbec5",
	"6abc151b-b827-4199-bfd8-03711000dec9",
	"3ce0d8e5-41fb-4622-98a9-f37ca5a1a8c5",
	"8861160e-92c9-46d0-a2d2-657e631be3fc",
	"ac844de0-4d5f-4c1c-9810-fe3c4b1518ff",
	"f017be6d-7969-40ce-82f6-9edd12482d3c",
	"1a9a0cd0-dcb2-43a8-959b-844d431eab87",
	"7ecb686f-1193-4cf5-8e49-615cc19bf65e",
	"7eec7b55-edff-43e2-babd-b6803d152428",
	"56da8980-9640-4be1-a0ed-878ae92407b4",
	"183bca02-c8d6-4f2b-8134-074bea7ba9d1",
	"9078a90b-37cf-4a5a-8ec4-3004b9b9bf36",
	"396f0dd3-9de6-4f70-bdfc-6923f4e1bdb4",
	"e74124c0-ce96-473c-bad2-164561981954",
	"8bba47d0-4043-4e64-a716-fce6c8a379f0",
	"b7bd4f59-b39d-412f-b7a5-0331c0bd54ac",
	"37a9dc5d-f415-4629-9c32-496abe5e64ff",
	"dfd0cb31-1810-4663-aa6b-e8b884878eda",
	"b96dd652-42f6-413a-8184-b0020e95ec3e",
	"68c2dcd1-8604-4614-bdaf-9eb498413294",
	"ec00cc4c-69f5-4270-8787-a04d47e1e53c",
	"0166cac2-74fd-47d8-bc0e-ed9dfe570347",
	"879075ad-34bd-4843-b694-d04f9f26fc22",
	"fc97d4a6-bc03-470a-ae19-846fda9ffce4",
	"cc5cfe73-8152-4d21-bf17-6437815ec2fc",
	"c11da3b2-bb31-41b3-b6a5-8532c9ab1d3f",
	"07adb240-ea9f-4b0f-90a8-dadbc1abdbe4",
	"bf88818b-4590-40fc-a99e-a5754d70e97c",
	"ea0da4a3-37b3-49e0-83ee-5b75da9ab788",
	"1c691720-98dc-4216-b522-35404a172179",
	"d6a20934-e12f-420d-ad50-6a3d030cde98",
	"7d4950e6-24a9-4f7c-98d2-f354d84eb8dd",
	"4224038a-e562-45d8-a377-bf0bc3e99b51",
	"16905c52-6e58-403e-ab84-5ff4660a2fbd",
	"df530baa-7050-444e-bc49-ce9014886eaf",
	"ab0b6119-96a5-4d38-a348-26c21ee21898",
	"c2e32627-6f2a-471d-99a7-8096ac3ab4f3",
	"3ad99b0f-9631-4888-8a80-c98f144b684f",
	"67a03313-3723-4a8c-b724-b56cf29ffbea",
	"0ef35246-795f-498a-ae1b-39bb5ba8cdd1",
	"16087b4f-ed6c-4169-aaf9-4c466c3e2f08",
	"1fce0d2d-2b66-4ee0-b528-1bd7adaed6df",
	"4e15a0a4-6244-4ad8-9a85-484a24104a6d",
	"bbaa263d-9e5f-4cbb-a89d-56af708d0350",
	"0a022995-df20-41c5-acce-4c19de5ac83b",
	"277ef922-d2f2-4267-b904-b9b10cb93aec",
	"9a762234-3d88-4770-be02-3eb9546b4e4b",
	"a629a6b8-38ab-4322-8499-695a992a3718",
	"e9cdf9a4-b66c-4b6a-ae61-df28bdc985d9",
	"b8e6213b-5a5e-4b65-b0ee-7ea7353b3837",
	"f2efd2c8-8ce9-4e5b-95d8-4a1ac5187c7e"
];

const deleteRecords = async () => {
	try {
		await BasicProfile.destroy({ where: { userId: userIds } });
		await User.destroy({ where: { id: userIds } });
		await asssignSurveys.destroy({ where: { userId: userIds } });
		await applicationAssignUser.destroy({ where: { applicationUser_id: userIds } });
		await messages.destroy({ where: { userId: userIds } });
		await notifications.destroy({ where: { userId: userIds } });
		await profileUserResponse.destroy({ where: { userId: userIds } });
		await redemptionRequest.destroy({ where: { userId: userIds } });
		await referrals.destroy({ where: { userId: userIds } });
		await rewards.destroy({ where: { userId: userIds } });

		await blacklistedSurveys.destroy({ where: { } });
		await surveyEmailSchedule.destroy({ where: { } });
		await surveyPartners.destroy({ where: { } });
		await surveys.destroy({ where: { } });
		await surveyTemplates.destroy({ where: { } });

		console.log('Records deleted successfully.');
	} catch (error) {
		console.error('Error deleting records:', error);
	}
};

// deleteRecords()
