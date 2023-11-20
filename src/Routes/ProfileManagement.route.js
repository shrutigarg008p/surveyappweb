const profileControllers = require('../Controllers/ProfileManagement.controller');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/profileManagement/create',
        profileControllers.create,
    );

    app.put(
        '/api/v1/profileManagement/update/:id',
        profileControllers.update,
    );

    app.get(
        '/api/v1/profileManagement/getAll/:limit',
        profileControllers.getAll,
    );

    app.get(
        '/api/v1/profileManagement/getOne/:id',
        profileControllers.getOne,
    );

    app.delete(
        '/api/v1/profileManagement/delete/:id',
        profileControllers.delete,
    );

};
