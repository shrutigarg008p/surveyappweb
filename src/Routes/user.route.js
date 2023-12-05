const usersController = require('../Controllers/users.controller');
const {checkDuplicateEmail, checkDuplicatePhone} = require('../Middlewares/userVarified');
const UserAuth = require('../Validators/User.validator');


module.exports= function(app) {
	app.use(function(req, res, next) {
		res.header(
			'Access-Control-Allow-Headers',
			'x-access-token, Origin, Content-Type, Accept',
		);
		next();
	});

	app.post(
		'/api/v1/auth/user/signup',
		[UserAuth.signUpValidator, checkDuplicateEmail, checkDuplicatePhone],
		usersController.registration,
	);

	app.post(
		'/api/v1/auth/user/login',
		UserAuth.logInValidator,
		usersController.userLogin,
	);

	app.put(
		'/api/v1/auth/user/update-basic-profile/:userId',
		[UserAuth.updateValidator],
		usersController.userUpdate,
	);

	app.get(
		'/api/v1/auth/user/verify-email',
		usersController.verifyEmail,
	);

	app.get(
		'/api/v1/auth/user/users/:limit',
		usersController.users,
	);

	app.get(
		'/api/v1/auth/user/get-user/:id',
		usersController.getUser,
	);

	app.post(
		'/api/v1/auth/user/reset-password',
		usersController.userPasswordReset,
	);

	app.post(
		'/api/v1/auth/user/Updatenew-password/:token',
		usersController.updateNewPassword,
	);

	app.post(
		'/api/v1/auth/user/unSubscribeUser/:userId',
		usersController.unSubscribeUser,
	);

	app.post(
		'/api/v1/auth/user/change-password',
		usersController.changePassword,
	);

	app.get(
		'/api/v1/auth/user/list/:limit/:type',
		usersController.basicProfileOnly,
	);

	app.post(
		'/api/v1/auth/user/allPanelist/:limit',
		usersController.allPanelists,
	);

	app.get(
		'/api/v1/auth/user/panelistProfile/:id',
		usersController.panelistProfile,
	);
};
