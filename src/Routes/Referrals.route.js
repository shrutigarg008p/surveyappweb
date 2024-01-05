const referralsControllers = require('../Controllers/Referrels.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/referrals/create',
        referralsControllers.createReferrals,
    );

    app.post(
        '/api/v1/referrals/bulkCreateReferrals',
        referralsControllers.bulkCreateReferrals,
    );

    app.put(
        '/api/v1/referrals/update/:id',
        referralsControllers.updateReferrals,
    );

    app.get(
        '/api/v1/referrals/getAll/:limit',
        referralsControllers.getAll,
    );

    app.get(
        '/api/v1/referrals/getAllUserReferrals/:userId/:limit',
        referralsControllers.getAllUserReferrals,
    );

    app.get(
        '/api/v1/referrals/getOne/:id',
        referralsControllers.getOne,
    );

    app.delete(
        '/api/v1/referrals/delete/:id',
        referralsControllers.deleteReferrals,
    );
};
