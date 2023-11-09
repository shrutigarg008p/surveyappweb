const redemptionController = require('../Controllers/redemptions.controller');
const {checkDuplicateEmail, checkDuplicatePhone} = require('../Middlewares/userVarified');
const RedemptionValidate = require('../Validators/Redemption.validator');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/redemption/create',
        [RedemptionValidate.createRedemption],
        redemptionController.createRedemptionMode,
    );

    app.put(
        '/api/v1/redemption/update/:id',
        RedemptionValidate.createRedemption,
        redemptionController.updateRedemptionMode,
    );

    app.get(
        '/api/v1/redemption/getAll/:limit',
        redemptionController.getAll,
    );

    app.get(
        '/api/v1/redemption/getOne/:id',
        redemptionController.getOne,
    );

    app.delete(
        '/api/v1/redemption/delete/:id',
        redemptionController.deleteRedemption,
    );
};
