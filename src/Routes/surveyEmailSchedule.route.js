const SurveyEmailScheduleControllers = require('../Controllers/surveyEmailSchedule.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/SurveyEmailSchedule/create',
        SurveyEmailScheduleControllers.create,
    );

    app.put(
        '/api/v1/SurveyEmailSchedule/update/:id',
        SurveyEmailScheduleControllers.update,
    );

    app.get(
        '/api/v1/SurveyEmailSchedule/getAll/:surveyId/:limit',
        SurveyEmailScheduleControllers.getAll,
    );

    app.get(
        '/api/v1/SurveyEmailSchedule/getOne/:id',
        SurveyEmailScheduleControllers.getOne,
    );

    app.delete(
        '/api/v1/SurveyEmailSchedule/delete/:id',
        SurveyEmailScheduleControllers.delete,
    );

    app.get(
        '/api/v1/SurveyEmailSchedule/sendNow/:id',
        SurveyEmailScheduleControllers.sendNow,
    );
};
