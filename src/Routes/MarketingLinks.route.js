const marketingLinksControllers = require('../Controllers/MarketingLinks.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/marketingLinks/create',
        marketingLinksControllers.create,
    );

    app.put(
        '/api/v1/marketingLinks/update/:id',
        marketingLinksControllers.update,
    );

    app.get(
        '/api/v1/marketingLinks/getAll/:limit',
        marketingLinksControllers.getAll,
    );

    app.get(
        '/api/v1/marketingLinks/getOne/:id',
        marketingLinksControllers.getOne,
    );

    app.delete(
        '/api/v1/marketingLinks/delete/:id',
        marketingLinksControllers.delete,
    );

};
