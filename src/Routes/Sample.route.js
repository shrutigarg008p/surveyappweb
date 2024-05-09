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


    app.get(
        '/api/v1/samples/getOneSampleUsers/:id',
        samplesControllers.getOneSampleUsers,
    );


    app.get(
        '/api/v1/samples/getOneSampleAllUsers/:id',
        samplesControllers.getOneSampleAllUsers,
    );

    app.post(
        '/api/v1/samples/uploadUniqueLinks',
        samplesControllers.uploadUniqueLinks,
    );

    app.delete(
        '/api/v1/samples/delete/:id',
        samplesControllers.delete,
    );

    app.post(
        '/api/v1/samples/create-questions',
        samplesControllers.createQuestion,
    );

    app.get(
        '/api/v1/samples/get-SampleQuestion/:id',
        samplesControllers.getQuestion,
    );

    app.get(
        '/api/v1/samples/get-SampleQuestions/:sampleId',
        samplesControllers.getSamplesQuestions,
    );

    app.delete(
        '/api/v1/samples/remove-question/:id',
        samplesControllers.removeQuestion,
    );
};
