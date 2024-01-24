const partnersControllers = require('../Controllers/Partners.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/partners/create',
        partnersControllers.create,
    );

    app.put(
        '/api/v1/partners/update/:id',
        partnersControllers.update,
    );

    app.get(
        '/api/v1/partners/getAll/:limit',
        partnersControllers.getAll,
    );

    app.get(
        '/api/v1/partners/getAllPartnerSurveys/:partnerId',
        partnersControllers.getAllPartnerSurveys,
    );

    app.get(
        '/api/v1/partners/getOne/:id',
        partnersControllers.getOne,
    );

    app.delete(
        '/api/v1/partners/delete/:id',
        partnersControllers.delete,
    );

};
