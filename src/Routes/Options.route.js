const optionsControllers = require('../Controllers/Options.controller');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/options/create',
        optionsControllers.create,
    );

    app.put(
        '/api/v1/options/update/:id',
        optionsControllers.update,
    );

    app.get(
        '/api/v1/options/getAll/:limit',
        optionsControllers.getAll,
    );

    app.get(
        '/api/v1/options/getOne/:id',
        optionsControllers.getOne,
    );

    app.delete(
        '/api/v1/options/delete/:id',
        optionsControllers.delete,
    );

};
