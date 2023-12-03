const NewsLettersControllers = require('../Controllers/NewsLetter.controller');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/newsLetters/create',
        NewsLettersControllers.create,
    );

    app.put(
        '/api/v1/newsLetters/update/:id',
        NewsLettersControllers.update,
    );

    app.get(
        '/api/v1/newsLetters/getAll/:limit',
        NewsLettersControllers.getAll,
    );

    app.get(
        '/api/v1/newsLetters/getOne/:id',
        NewsLettersControllers.getOne,
    );

    app.delete(
        '/api/v1/newsLetters/delete/:id',
        NewsLettersControllers.delete,
    );

    app.post(
        '/api/v1/newsLetters/create-newsletter-sample',
        NewsLettersControllers.createNewsletterSamples,
    );
};
