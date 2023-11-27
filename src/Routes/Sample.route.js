const samplesControllers = require('../Controllers/Samples.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/samples/create',
        samplesControllers.create,
    );

    app.put(
        '/api/v1/samples/update/:id',
        samplesControllers.update,
    );

    app.get(
        '/api/v1/samples/getAll/:limit',
        samplesControllers.getAll,
    );

    app.get(
        '/api/v1/samples/getOne/:id',
        samplesControllers.getOne,
    );

    app.delete(
        '/api/v1/samples/delete/:id',
        samplesControllers.delete,
    );
};
