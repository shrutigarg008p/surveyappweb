const rewardsController = require('../Controllers/Rewards.controllers');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/rewards/create',
        rewardsController.createRewards,
    );

    app.put(
        '/api/v1/rewards/update/:id',
        rewardsController.updateRewards,
    );

    app.get(
        '/api/v1/rewards/getAll/:limit',
        rewardsController.getAll,
    );

    app.get(
        '/api/v1/rewards/getAllByUserId/:userId/:limit',
        rewardsController.getAllByUserId,
    );

    app.get(
        '/api/v1/rewards/getOne/:id',
        rewardsController.getOne,
    );

    app.delete(
        '/api/v1/rewards/delete/:id',
        rewardsController.deleteRewards,
    );
};
