const db = require('../models');
const User = db.user;
const BasicProfile = db.basicProfile;
const Questions = db.questions;
const Profiles = db.profiles;
const Referrals = db.referrals;
const City = db.city;
const Sequelize = db.Sequelize;
const States = db.states;
const Rewards = db.rewards;
const AssignSurveys = db.asssignSurveys;
const Messages = db.messages;
const RedemptionRequest = db.redemptionRequest;
const NotificationsDb = db.notifications;
const ProfileUserResponse = db.profileUserResponse;
const apiResponses = require('../Components/apiresponse');
const {createToken} = require('../Middlewares/userAuthentications');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const moment = require('moment');
const ip = require('ip');
const Mails = require("../Config/Mails");
const {BOOLEAN, literal} = require("sequelize");
const {bool} = require("twilio/lib/base/serialize");
const {userRegistration} = require("../Config/Mails");
const axios = require("axios");
const {sendVerificationMessage, generateOTP, sendVerificationMessageHindi} = require("../Config/Sms");
const {respondentSummary, getRewardsSummary, getRedemptionSummary, getReferralSummary, userAssignedSurveys} = require("../utils/RespondentSummary");
const {validateDob} = require("../utils/dateValidations");
const {updateUsersWithCityNames} = require("../utils/UsersCityNameReplaceWithEng");
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
				const rewardsExist = await Rewards.findOne({ where: { userId: req.body.referralId, referralId: user.id, rewardType: 'Referral' } })
				if(!rewardsExist) {
					await Rewards.create({
						points: 25,
						rewardType: 'Referral',
						referralId: user.id,
						rewardStatus: 'Pending',
						userId: req.body.referralId,
						createdAt: new Date().valueOf(),
						updatedAt: new Date().valueOf(),
						rewardDate: new Date().valueOf(),
					})
				}
			} else {
				const referralExist = await Referrals.findOne({
					where: {
						userId: req.body.referralId,
						referredUserId: user.id
					}
				})
				if (!referralExist) {
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
					const rewardsExist = await Rewards.findOne({
						where: {
							userId: req.body.referralId,
							referralId: user.id,
							rewardType: 'Referral'
						}
					})
					if (!rewardsExist) {
						await Rewards.create({
							points: 25,
							rewardType: 'Referral',
							referralId: user.id,
							rewardStatus: 'Pending',
							userId: req.body.referralId,
							createdAt: new Date().valueOf(),
							updatedAt: new Date().valueOf(),
							rewardDate: new Date().valueOf(),
						})
					}
				}
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
				email: '',
				userName: '',
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
			if(req.body.referralId) {
				const isExist = await Referrals.findOne({ where: { email: user.email, userId: req.body.referralId } })
				if(isExist) {
					await Referrals.update(
						{ referredUserId: user.id, referralStatus: "Accepted" },
						{ where: { email: user.email, userId: req.body.referralId }}
					)
					const rewardsExist = await Rewards.findOne({ where: { userId: req.body.referralId, referralId: user.id, rewardType: 'Referral' } })
					if(!rewardsExist) {
						await Rewards.create({
							points: 25,
							rewardType: 'Referral',
							referralId: user.id,
							rewardStatus: 'Pending',
							userId: req.body.referralId,
							createdAt: new Date().valueOf(),
							updatedAt: new Date().valueOf(),
							rewardDate: new Date().valueOf(),
						})
					}
				} else {
					const referralExist = await Referrals.findOne({
						where: {
							userId: req.body.referralId,
							referredUserId: user.id
						}
					})
					if (!referralExist) {
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
						const rewardsExist = await Rewards.findOne({
							where: {
								userId: req.body.referralId,
								referralId: user.id,
								rewardType: 'Referral'
							}
						})
						if (!rewardsExist) {
							await Rewards.create({
								points: 25,
								rewardType: 'Referral',
								referralId: user.id,
								rewardStatus: 'Pending',
								userId: req.body.referralId,
								createdAt: new Date().valueOf(),
								updatedAt: new Date().valueOf(),
								rewardDate: new Date().valueOf(),
							})
						}
					}
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
		const appType = req.headers['app_type'] || 'web';

		let obj = {
			userId: req.params.userId,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			gender: req.body.gender,
			dateOfBirth: appType === 'mobile' ?  moment(req.body.dateOfBirth, "DD/MM/YYYY").format("YYYY/MM/DD") : req.body.dateOfBirth,
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

		const validateDate = validateDob(obj.dateOfBirth)
		if(validateDate === false) {
			const msg = `${language === 'hi' ? 'कृपया कोई मान्य जन्मतिथि दर्ज करें । पैनलिस्ट के रूप में पंजीकरण करने के लिए आपकी आयु 16 वर्ष से अधिक होनी चाहिए ।' : 'Please enter a valid Date of Birth. You must be above 16 years of Age to register as a panelist.'}`;
			return apiResponses.validationErrorWithData(res, msg, null);
		}

		const isExist = await BasicProfile.findOne({ where: { userId: req.params.userId } })
		if(!isExist) {

			const isMobileVerified = await User.findOne({ where: { id: req.params.userId } })
			const userNotExist = `${language === 'hi' ? 'उपभोगकर्ता मौजूद नहीं।' : 'User does not exist.'}`;
			const userNotVerified = `${language === 'hi' ? 'कृपया पहले मोबाइल ओटीपी सत्यापित करें ।' : 'Please verify mobile OTP first.'}`;

			if(!isMobileVerified) {
				return apiResponses.validationErrorWithData(res, userNotExist, null);
			}

			if(isMobileVerified && isMobileVerified.phoneNumberConfirmed === false) {
				return apiResponses.validationErrorWithData(res, userNotVerified, null);
			}


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
			await Rewards.update({ rewardStatus: 'Accepted' },{ where: { referralId: req.params.userId, rewardType: 'Referral', rewardStatus: 'Pending' }})
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
		const language = req.headers['language'] || req.body.language || req.query.language || 'en';
		const user = await User.findOne({where: {id: req.params.id}})
		const profile = await BasicProfile.findOne({where: {userId: req.params.id}})
			/* #swagger.responses[404] = {
                       description: "Email Not found.",
                       schema: { $statusCode: "404",  $status: false, $message: "User Not found.",  $data: {}}
                   } */
			// return res.status(404).send({ message: "User Not found." });


		const {
			overallAttemptedPercentage,
		} = await respondentSummary(req.params.id);
		let dashboardMessage = {}
		if(overallAttemptedPercentage < 100) {
			if(language === 'hi'){
				dashboardMessage = {
					messages: 'आपकी प्रोफ़ाइल लंबित है, कृपया 50 i-प्वाइंट प्राप्त करने के लिए इसे पूरा करें। प्रोफ़ाइल भरना शुरू करने के लिए यहाँ क्लिक करें, प्रोफ़ाइल प्रश्नों पर नेविगेट करने के लिए कृपया बाएँ और दाएँ स्वाइप करें।',
					colourCode: '#FF0000'
				}
			} else {
				dashboardMessage = {
					messages: 'Your profile is pending, please complete it to get 50 i-Points. Click Here to start filling profile, Please do left and right swipe to navigate through profile questions.',
					colourCode: '#FF0000'
				}
			}
		} else {
			if(language === 'hi'){
				dashboardMessage = {
					messages: 'आपकी प्रोफ़ाइल पूरी हो गई है, अपना इनाम देखने के लिए यहां क्लिक करें।',
					colourCode: '#00FF00'
				}
			} else {
				dashboardMessage = {
					messages: 'Your profile is completed, click here to view your reward',
					colourCode: '#00FF00'
				}
			}
		}

			return apiResponses.successResponseWithData(res, 'success!', {...user, profile, dashboardMessage});
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
					// deleteConfirmDate: new Date().valueOf(),
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

				await User.destroy(
					{where: {id: req.params.userId}}
				)

				await BasicProfile.destroy(
					{where: {userId: req.params.userId}}
				)

				await RedemptionRequest.destroy({
					where: { userId: req.params.userId }
				});

				await Rewards.destroy({
					where: { userId: req.params.userId }
				});

				await ProfileUserResponse.destroy({
					where: { userId: req.params.userId }
				});

				await AssignSurveys.destroy({
					where: { userId: req.params.userId }
				});
				await Messages.destroy({
					where: { userId: req.params.userId }
				});

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
		console.log('error---->', err)
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
				// attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
				required: false,
			}],
		// limit: limit,
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
						// limit: limit,
						order: [['createdAt', 'DESC']]
					})
				} else if(req.params.type === 'deleteRequestOnly') {
					data = await User.findAll({
						where: {
							deleteRequestDate: {
								[Sequelize.Op.ne]: null,
							},
							deleteConfirmDate: null
						},
						attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'deleteRequestDate', 'deleteConfirmDate'],
						include: [{
							model: BasicProfile,
							attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName'],
							required: false,
						}],
						// limit: limit,
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
						// limit: limit,
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
						// limit: limit,
						order: [['createdAt', 'DESC']]
					})
				}
				const users = await updateUsersWithCityNames(data)
				return apiResponses.successResponseWithData(res, 'success!', users);
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
		const limit = 100000;
		let whereClauseProfile = {};
		let whereClauseUser = {deleteConfirmDate: null };
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
				// where: { id: '76d7735c-dac2-44b4-8708-e0e8a265383f' },
				attributes: ['phoneNumber', 'id', 'email', 'createdAt', 'deleteRequestDate', 'activeStatus'],
				include: [
					{
						model: BasicProfile,
						attributes: ['firstName', 'lastName', 'dateOfBirth', 'city', 'firstName', 'lastName', 'gender', 'mobile', 'state'],
						required: false
					},
				],
				// limit: 10,
				order: [['createdAt', 'DESC']]
			});



			let mergedArray = []
			// if(filteredProfilePanelists.length > filteredUserPanelists.length) {
			// 	mergedArray = filteredProfilePanelists.map(user => {
			// 		const matchingPanelist = filteredUserPanelists.find(panelist => panelist.id === user.userId);
			// 		return {
			// 			"userId": user.userId || matchingPanelist.id,
			// 			"isActive": matchingPanelist.activeStatus,
			// 			"firstName": user.firstName || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.firstName : '',
			// 			"lastName": user.lastName || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.lastName : '',
			// 			"gender": user.gender || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.gender : '',
			// 			"mobile": matchingPanelist ? matchingPanelist.phoneNumber : user ? user.mobile : '',
			// 			"email": user.email || matchingPanelist ? matchingPanelist.email : '',
			// 			"dateOfBirth": user.dateOfBirth || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.dateOfBirth : '',
			// 			"city": user.city || matchingPanelist.basic_profile ? matchingPanelist.basic_profile.city : '',
			//
			// 		}
			// 	});
			// } else {
			// 	mergedArray = filteredUserPanelists.map(user => {
			// 		const matchingPanelist = filteredProfilePanelists.find(panelist => panelist.userId === user.id);
			// 		return {
			// 			"userId": user.id || matchingPanelist.userId,
			// 			"isActive": user.activeStatus,
			// 			"firstName": matchingPanelist ? matchingPanelist.firstName : user.basic_profile ? user.basic_profile.firstName : '',
			// 			"lastName": matchingPanelist ? matchingPanelist.lastName : user.basic_profile ? user.basic_profile.lastName : '',
			// 			"gender": matchingPanelist ? matchingPanelist.gender : user.basic_profile ? user.basic_profile.gender : '',
			// 			"mobile": user.phoneNumber,
			// 			"email": user.email || '',
			// 			"dateOfBirth": matchingPanelist ? matchingPanelist.dateOfBirth : user.basic_profile ? user.basic_profile.dateOfBirth : '',
			// 			"city": matchingPanelist ? matchingPanelist.city : user.basic_profile ? user.basic_profile.city : '',
			// 		}
			// 	});
			// }
		// const filteredPanelists = filteredUserPanelists.filter(panelist => panelist.phoneNumber || panelist.email);
		const users = await updateUsersWithCityNames(filteredUserPanelists)
		return apiResponses.successResponseWithData(res, 'success!',  users);
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
				const {
					totalSurveys,
					incompleteSurveys,
					completeSurveys,
					notStartedSurveys,
					totalRewardPoints,
				} = await respondentSummary(req.params.id);
				const {
					referralsPoints,
					surveyPoints,
					totalPoints,
					leftPoints
				} = await getRewardsSummary(req.params.id);
				const {
					totalEarned,
					totalRedeemed,
					totalPendingRedeemed,
					totalLeft
				} = await getRedemptionSummary(req.params.id);
				const {
					totalCount,
					approvedCount,
				} = await getReferralSummary(req.params.id);
				const assignedSurveys = await userAssignedSurveys(req.params.id)
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
						totalCount: totalSurveys || 0,
						completedCount: completeSurveys || 0,
						inCompletedCount: incompleteSurveys || 0,
						notStartedCount: notStartedSurveys || 0,
						list: assignedSurveys
					},
					rewards: {
						earnedBySurvey: surveyPoints || 0,
						earnedByReferrals: referralsPoints || 0,
						totalLeftPoints: leftPoints || 0,
						list: []
					},
					referrals: {
						totalCount: totalCount || 0,
						approvedCount: approvedCount || 0,
						inCompletedCount: 0,
						notStartedCount: 0,
						list: []
					},
					redemption: {
						totalEarned: totalEarned || 0,
						totalRedeemed: totalRedeemed || 0,
						totalPendingRedeemed: totalPendingRedeemed || 0,
						totalLeft: totalLeft || 0
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



module.exports.respondentProfileOverview = async (req, res) => {
	try {
		const language = req.headers['language'] || req.query.language || 'en';
		const appType = req.headers['app_type'] || 'web';
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

		let result = []
		if(appType === 'mobile') {
			result = resultIn.map(profile => ({
				...profile,
				name: language === 'hi' ? `${profile.hindi} - ${profile.attemptedPercentage}%` : `${profile.name} - ${profile.attemptedPercentage}%`,
			}))
		} else {
			result = resultIn.map(profile => ({
				...profile,
				name: language === 'hi' ? profile.hindi : profile.name,
			}))
		}
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
	"d39658cc-3a9d-4092-9996-f17bdd2741a3",
	"f72b6459-0ff3-4f0e-8c16-3234468cbbe4",
	"90ddac1b-efb9-4a7c-9b00-bc6e39145a4d",
	"efcbe4d8-fa7c-4637-bc6d-0d3c31df8275",
	"435e155c-b374-4808-b192-57541d166bdd",
	"3afe62a4-8b40-4297-bc58-6b3c65bc0a46",
	"3fa94efe-fabe-41e8-896e-92bc27920cbd",
	"6fad1ae3-a1ad-4d3a-abec-9fdbf90e7fea",
	"8c9aec56-e5ce-47cf-8ef2-040040cb5522",
	"be756277-23e7-44a9-bcda-50da42c5b453",
	"3771eaf3-bdc7-4fad-a2bb-95f2c1ff6a69",
	"72fcb7ce-a3d1-47dd-8360-09df09c5d2ce"
];

const deleteRecords = async () => {
	try {
		await BasicProfile.destroy({ where: { userId: {[Op.notIn]: userIds } }});
		await User.destroy({ where: { id: {[Op.notIn]: userIds } }});
		await asssignSurveys.destroy({ where: { userId: {[Op.notIn]: userIds } }});
		await applicationAssignUser.destroy({ where: { applicationUser_id: {[Op.notIn]: userIds }} });
		await messages.destroy({ where: { userId: {[Op.notIn]: userIds } }});
		await notifications.destroy({ where: { userId: {[Op.notIn]: userIds } }});
		await profileUserResponse.destroy({ where: { userId: {[Op.notIn]: userIds } } });
		await redemptionRequest.destroy({ where: { userId: {[Op.notIn]: userIds } }});
		await referrals.destroy({ where: { userId: {[Op.notIn]: userIds } }});
		await rewards.destroy({ where: { userId: {[Op.notIn]: userIds } }});

		// await blacklistedSurveys.destroy({ where: { } });
		// await surveyEmailSchedule.destroy({ where: { } });
		// await surveyPartners.destroy({ where: { } });
		// await surveys.destroy({ where: { } });
		// await surveyTemplates.destroy({ where: { } });

		console.log('Records deleted successfully.');
	} catch (error) {
		console.error('Error deleting records:', error);
	}
};

// deleteRecords()
