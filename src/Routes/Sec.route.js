const secControllers = require('../Controllers/Sec.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/sec/create',
        secControllers.create,
    );

    app.put(
        '/api/v1/sec/update/:id',
        secControllers.update,
    );

    app.get(
        '/api/v1/sec/getAll/:limit',
        secControllers.getAll,
    );

    app.get(
        '/api/v1/sec/getOne/:id',
        secControllers.getOne,
    );

    app.delete(
        '/api/v1/sec/delete/:id',
        secControllers.delete,
    );

};
