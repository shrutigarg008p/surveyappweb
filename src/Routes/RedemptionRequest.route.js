const redemptionRequestController = require('../Controllers/RedemptionRequest.controllers');
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
        '/api/v1/redemptionRequest/create',
        redemptionRequestController.createRedemptionRequest,
    );

    app.put(
        '/api/v1/redemptionRequest/update/:id',
        redemptionRequestController.updateRedemptionRequest,
    );

    app.get(
        '/api/v1/redemptionRequest/getAll/:limit',
        redemptionRequestController.getAll,
    );

    app.get(
        '/api/v1/redemptionRequest/getAllByUserId/:userId/:limit',
        redemptionRequestController.getAllByUserId,
    );

    app.get(
        '/api/v1/redemptionRequest/getOne/:id',
        redemptionRequestController.getOne,
    );

    app.delete(
        '/api/v1/redemptionRequest/delete/:id',
        redemptionRequestController.deleteRedemption,
    );

    app.post(
        '/api/v1/redemptionRequest/approveRequest',
        redemptionRequestController.ApproveRequest,
    );

    app.post(
        '/api/v1/redemptionRequest/rejectRequest',
        redemptionRequestController.RejectRequest,
    );

    app.post(
        '/api/v1/redemptionRequest/manualApprove',
        redemptionRequestController.manualApprove,
    );

    app.post(
        '/api/v1/redemptionRequest/manualBulkApprove',
        redemptionRequestController.manualBulkApprove,
    );
};
