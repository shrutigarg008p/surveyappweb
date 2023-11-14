const countriesController = require('../Controllers/countries.controller');
const CountriesValidator = require('../Validators/Country.validator');


module.exports= function(app) {
    app.use(function(req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });

    app.post(
        '/api/v1/country/create',
        // [CountriesValidator.create],
        countriesController.create,
    );

    app.put(
        '/api/v1/country/update/:id',
        // CountriesValidator.create,
        countriesController.update,
    );

    app.get(
        '/api/v1/country/getAll/:limit',
        countriesController.getAll,
    );

    app.get(
        '/api/v1/country/getOne/:id',
        countriesController.getOne,
    );

    app.delete(
        '/api/v1/country/delete/:id',
        countriesController.delete,
    );


    app.post(
        '/api/v1/country/createState',
        // [CountriesValidator.create],
        countriesController.createState,
    );

    app.post(
        '/api/v1/country/createCity',
        // [CountriesValidator.create],
        countriesController.createCity,
    );

    app.get(
        '/api/v1/country/getAllStates/:limit',
        countriesController.getAllStates,
    );

    app.get(
        '/api/v1/country/getAllStatesByCountryId/:countryId/:limit',
        countriesController.getAllStatesByCountryId,
    );

    app.get(
        '/api/v1/country/getAllCitiesByStateId/:stateId/:limit',
        countriesController.getAllCitiesByStateId,
    );

    app.get(
        '/api/v1/country/getAllCities/:limit',
        countriesController.getAllCities,
    );
};
