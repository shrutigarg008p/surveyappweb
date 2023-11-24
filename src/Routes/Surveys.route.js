const surveyControllers = require('../Controllers/surveys.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/surveys/create',
        surveyControllers.create,
    );

    app.put(
        '/api/v1/surveys/update/:id',
        surveyControllers.update,
    );

    app.get(
        '/api/v1/surveys/getAll/:limit',
        surveyControllers.getAll,
    );

    app.get(
        '/api/v1/surveys/getOne/:id',
        surveyControllers.getOne,
    );

    app.delete(
        '/api/v1/surveys/delete/:id',
        surveyControllers.delete,
    );
};
