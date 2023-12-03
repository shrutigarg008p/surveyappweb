const MessagesControllers = require('../Controllers/Messages.controller');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/messages/create',
        MessagesControllers.create,
    );

    app.put(
        '/api/v1/messages/update/:id',
        MessagesControllers.update,
    );

    app.get(
        '/api/v1/messages/getAll/:limit',
        MessagesControllers.getAll,
    );

    app.get(
        '/api/v1/messages/getOne/:id',
        MessagesControllers.getOne,
    );

    app.delete(
        '/api/v1/messages/delete/:id',
        MessagesControllers.delete,
    );
};
