const db = require('../models');
const User = db.user;
const BasicProfile = db.basicProfile;
const apiResponses = require('../Components/apiresponse');
const {createToken} = require('../Middlewares/userAuthentications');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ip = require('ip');
const Mails = require("../Config/Mails");
const {BOOLEAN, literal} = require("sequelize");
const {bool} = require("twilio/lib/base/serialize");
const {userRegistration} = require("../Config/Mails");
const Op = db.Sequelize.Op;

module.exports.registration = async (req, res) => {
	try {
		console.log('body----->', req.body)
		const token = createToken(req.body.email);
		const user = await User.create({
			email: req.body.email,
			userName: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.password, 8),
			phoneNumber: req.body.phoneNumber,
			registeredDate: new Date().valueOf(),
			createdAt: new Date().valueOf(),
			updatedAt: new Date().valueOf(),
			isActive: req.body.isActive,
			signupIp: req.ip,
			role: 'panelist',
			registerType: 'password',
			emailConfirmed: false,
			phoneNumberConfirmed: false,
			twoFactorEnabled: false,
			lockoutEnabled: false,
			accessFailedCount: 0,
			securityStamp: token,
			activeStatus: 0
		})
		/* #swagger.responses[200] = {
                        description: "User registered successfully!",
                        schema: { $statusCode : 200 ,$status: true, $message: "User registered successfully!", $data : {}}
                    } */
		await Mails.userRegistration(user.email, token);
		// return res.status(200).send({ status:'200', message: "User registered successfully!" , data: userData });
		return apiResponses.successResponseWithData(
			res,
			'User registered successfully!',
		);
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
		/* #swagger.responses[200] = {
                        description: "Mail Resend successfully!",
                        schema: { $statusCode : 200 ,$status: true, $message: "Mail Resend successfully!", $data : {}}
                    } */
		await Mails.userRegistration(req.body.email, token);
		// return res.status(200).send({ status:'200', message: "Mail Resend successfully!" , data: userData });
		return apiResponses.successResponseWithData(
			res,
			'Success!',
		);
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
					// securityStamp: req.query.token,
				},
			})
			if (user) {
				await User.update({
					securityStamp: '',
					emailConfirmed: true
				}, {where: {id: user.id}})
				/* #swagger.responses[200] = {
                                description: "Mail Resend successfully!",
                                schema: { $statusCode : 200 ,$status: true, $message: "Mail Resend successfully!", $data : {}}
                            } */
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

module.exports.userLogin = async (req, res) => {
	// #swagger.tags = ['UserAuth']
	/*  #swagger.parameters['obj'] = {
            in: 'body',
            description: "User details for login - email, registerType and password",
            schema: { $email: "", $registerType:"", $password: ""}
    } */
	if (req.body.registerType === 'password') {
		const user = await User.findOne({
			where: {
				email: req.body.email,
				registerType: req.body.registerType,
			},
		})
		if (!user) {
			/* #swagger.responses[404] = {
                   description: "User Not found.",
                   schema: { $statusCode: "404",  $status: false, $message: "User Not found.",  $data: {}}
               } */
			// return res.status(404).send({ message: "User Not found." });
			return apiResponses.notFoundResponse(res, 'User Not found.', {});
		}

		const passwordIsValid = bcrypt.compareSync(
			req.body.password,
			user.passwordHash,
		);

		if (!passwordIsValid) {
			/* #swagger.responses[401] = {
                    description: "Invalid Password!",
                    schema: { $accessToken: "", $message: "Invalid Password!" }
                } */
			// return res.status(401).send({
			//   accessToken: null,
			//   message: "Invalid Password!"
			// });
			return apiResponses.unauthorizedResponse(
				res,
				'Invalid Password!',
				null,
			);
		}
		if (user.deletedAt) {
			/* #swagger.responses[401] = {
                    description: "Your email is not verified, please verify before logging in.",
                    schema: { $accessToken: "", $message: "Your email is not verified, please verify before logging in." }
                } */
			// return res.status(401).send({
			//   accessToken: null,
			//   message: "User not available."
			// });
			return apiResponses.unauthorizedResponse(
				res,
				'User not available',
				null,
			);
		}

		const token = createToken(user.id, user.email, user.role);
		/* #swagger.responses[500] = {
                    description: "User logged in!",
                    schema: { $id: "user id", $email: "user email",  $accessToken: "user token"}
                } */
		// return res.status(200).send({
		//   id: user.id,
		//   email: user.email,
		//   accessToken: token
		// });
		const isExist = await BasicProfile.findOne({ where: { userId: user.id } })
		const obj = {
			id: user.id,
			email: user.email,
			phoneNumber: user.phoneNumber,
			registerType: user.registerType,
			role: user.role,
			emailConfirmed: user.emailConfirmed,
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
					if(req.body.email) {
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
				const isExist = await BasicProfile.findOne({ where: { userId: user.id } })
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
			return apiResponses.successResponseWithData(res, 'Success Created', user);
		} else {
			delete obj.userId
			const user = await BasicProfile.update(
				obj, { where: { userId: req.params.userId } }
			)
			return apiResponses.successResponseWithData(res, 'Success Update', user);

		}
	} catch (err) {
		return apiResponses.errorResponse(res, err);
	}
};

module.exports.unSubscribeUser = async (req, res) => {
	try {
		let obj = {
			unsubscribeDate: new Date().valueOf(),
			unsubscribeRequestDate: new Date().valueOf(),
			updatedAt: new Date().valueOf()
		}

		const isExist = await User.findOne({ where: { userId: req.params.userId } })
		if(!isExist) {
			const user = await BasicProfile.create(
				obj
			)
			return apiResponses.successResponseWithData(res, 'Success Created', user);
		} else {
			return apiResponses.validationErrorWithData(res, 'User not found', null);
		}
	} catch (err) {
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
			{where: {email: req.body.email, registerType: 'normal'},
			})
			.then((user) => {
				if (!user) {
					return apiResponses.successResponseWithData(res, ' User with this email doesn\'t exists.');
				}
				crypto.randomBytes(32, async (err, buffer)=>{
					if (err) {
						console.log(err);
					}
					const token = buffer.toString('hex');
					User.update(
						{
							resetToken: token,
							expireToken: Date.now() + 3600000,
						},
						{
							where: {email: req.body.email},
						},
					).then((user) => {
						if (!user) {
							return apiResponses.notFoundResponse(res, 'Not found.', {});
						}
					});

					await Mail.userPasswordReset(user.email, token);
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
				password: await bcrypt.hashSync(req.body.password, 8),
				resetToken: null,
				expireToken: null,
			},
			{where: {resetToken: sentToken, expireToken: {[Op.gt]: Date.now()}},
			})
			.then(async (user) => {
				if (!user) {
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
		User.update({
				password: await bcrypt.hashSync(req.body.password, 8),
			},
			{where: {id: req.body.userId},
			})
			.then(async (user) => {
				if (!user) {
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
						"mobile": user.phoneNumber || matchingPanelist.mobile || '',
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




// async function test() {
// 	await Mails.userRegistration('lsksl@g.com', '');
// }
//
// test()
