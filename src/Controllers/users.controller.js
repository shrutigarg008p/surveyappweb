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
const {sendVerificationMessage, generateOTP} = require("../Config/Sms");
const Op = db.Sequelize.Op;


module.exports.registration = async (req, res) => {
	try {

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
			activeStatus: 0,
			otp: OTP
		})
		await Mails.userRegistration(user.email, token);
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
		await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
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
				phoneNumber: req.body.phoneNumber,
				registerType: req.body.registerType
			},
		})
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
			await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
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
			await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
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
		const OTP = generateOTP();
		const info = await User.update({
			otp: OTP,
		}, { where: { id: req.body.userId, phoneNumber: req.body.phoneNumber }})

		if(info[0] === 1) {
			await sendVerificationMessage(OTP, req.body.phoneNumber, 'User')
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
					phoneNumber: verifyUser.phoneNumber
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
				await sendVerificationMessage(OTP, user.phoneNumber, 'User')
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
				basicProfile: isExist
			};
			return apiResponses.successResponseWithData(
				res,
				'Successfully login',
				obj,
			);
		} else if (req.body.registerType === 'facebook') {
			User.findOne({
				where: {
					facebookToken: req.body.facebookToken,
					registerType: req.body.registerType,
				},
			}).then(async (user) => {
				if (!user) {
					User.create({
						email: req.body.email,
						registerType: req.body.registerType,
						phoneNumber: req.body.phoneNumber,
						facebookToken: req.body.facebookToken,
						isActive: req.body.isActive,
					}).then(async (user) => {
						const token = createToken(user.id, user.email, user.role);
						const userData = {
							id: user.id,
							email: user.email,
							country: user.country,
							city: user.city,
							phoneNumber: user.phoneNumber,
							registerType: user.registerType,
							role: user.role,
							token: token,
						};
						if (req.body.email) {
							await Mails.userRegistration(user.email, 'Unknown');
						}

						// return res.status(200).send({ status:'200', message: "User registered successfully!" , data: userData });
						return apiResponses.successResponseWithData(
							res,
							'Success!',
							userData,
						);
					});
				} else {
					const isExist = await BasicProfile.findOne({where: {userId: user.id}})
					const token = createToken(user.id, user.email, user.role);
					const obj = {
						id: user.id,
						email: user.email,
						phoneNumber: user.phoneNumber,
						registerType: user.registerType,
						role: user.role,
						token: token,
						basicProfile: isExist
					};
					return apiResponses.successResponseWithData(
						res,
						'Successfully login',
						obj,
					);
				}
			});
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
						basicProfile: isExist
					};
					return apiResponses.successResponseWithData(
						res,
						'Successfully login',
						obj,
					);
				}
			});
		}
	} catch (err){
		console.log('err--->', err)
	}
};

module.exports.userUpdate = async (req, res) => {
	try {
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
			const user = await BasicProfile.update(
				obj, { where: { userId: req.params.userId } }
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

					await Mails.userPasswordReset(user.email, token);
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
						"email": user.email || matchingPanelist.email || '',
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
		const users = await User.findOne({ where: { id: req.params.id }, attributes: ['unsubscribeDate', 'id', 'deleteRequestDate']})
		const result = profilesWithQuestionsCount.map(section => {
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
		const overallTotalQuestions = result.reduce((total, section) => total + section.totalQuestions, 0);
		const overallAttemptedQuestions = result.reduce((total, section) => total + section.attemptedQuestions, 0);
		const overallAttemptedPercentage = Math.round((overallAttemptedQuestions / overallTotalQuestions) * 100);
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


// async function test() {
// 	await Mails.userRegistration('lsksl@g.com', '');
// }
//
// test()
