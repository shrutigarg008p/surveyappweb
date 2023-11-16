const labelsControllers = require('../Controllers/Labels.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/labels/create',
        labelsControllers.create,
    );

    app.put(
        '/api/v1/labels/update/:id',
        labelsControllers.update,
    );

    app.get(
        '/api/v1/labels/getAll/:limit',
        labelsControllers.getAll,
    );

    app.get(
        '/api/v1/labels/getOne/:id',
        labelsControllers.getOne,
    );

    app.delete(
        '/api/v1/labels/delete/:id',
        labelsControllers.delete,
    );

};
