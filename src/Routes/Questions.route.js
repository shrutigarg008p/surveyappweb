const questionControllers = require('../Controllers/Questions.controller');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/questions/create',
        questionControllers.create,
    );

    app.put(
        '/api/v1/questions/update/:id',
        questionControllers.update,
    );

    app.get(
        '/api/v1/questions/getAll/:limit',
        questionControllers.getAll,
    );

    app.get(
        '/api/v1/questions/getOne/:id',
        questionControllers.getOne,
    );

    app.delete(
        '/api/v1/questions/delete/:id',
        questionControllers.delete,
    );

};
