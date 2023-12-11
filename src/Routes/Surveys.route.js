const surveyControllers = require('../Controllers/surveys.controllers');
const surveyTemplateControllers = require('../Controllers/SurveyTemplates.controllers');


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

    app.post(
        '/api/v1/surveys/add-partners',
        surveyControllers.AddPartners,
    );



    app.post(
        '/api/v1/surveys/create-template',
        surveyTemplateControllers.create,
    );

    app.put(
        '/api/v1/surveys/update-template/:id',
        surveyTemplateControllers.update,
    );

    app.get(
        '/api/v1/surveys/getAll-template/:id/:limit',
        surveyTemplateControllers.getAll,
    );

    app.get(
        '/api/v1/surveys/getOne-template/:id',
        surveyTemplateControllers.getOne,
    );

    app.delete(
        '/api/v1/surveys/delete-template/:id',
        surveyTemplateControllers.delete,
    );
};
