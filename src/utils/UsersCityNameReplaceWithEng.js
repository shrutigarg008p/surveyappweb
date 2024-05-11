const db = require('../models');
const City = db.city;
const States = db.states;
const Op = db.Sequelize.Op;



async function updateUsersWithCityNames(users) {
    try {
        // Fetch all cities and states
        const [cities, states] = await Promise.all([
            City.findAll({ attributes: ['id', 'name', 'hindi'] }),
            States.findAll({ attributes: ['id', 'name', 'hindi'] })
        ]);

        // Create maps for quick lookup
        const cityMap = new Map(cities.map(city => [city.hindi, city.name]));
        const stateMap = new Map(states.map(state => [state.hindi, state.name]));

        // Update city and state names for each user
        for (const user of users) {
            if (user.basic_profile && user.basic_profile.city) {
                const cityNameInHindi = user.basic_profile.city;
                if (cityMap.has(cityNameInHindi)) {
                    user.basic_profile.city = cityMap.get(cityNameInHindi);
                }
            }
            if (user.basic_profile && user.basic_profile.state) {
                const stateNameInHindi = user.basic_profile.state;
                if (stateMap.has(stateNameInHindi)) {
                    user.basic_profile.state = stateMap.get(stateNameInHindi);
                }
            }
        }

        return users;
    } catch (error) {
        console.error('Error updating users with city names:', error);
        throw error;
    }
}


module.exports = {
    updateUsersWithCityNames,
}
