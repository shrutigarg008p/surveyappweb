const config = require('../Config/db.config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
	host: config.HOST,
	dialect: config.dialect,
	operatorsAliases: false,

	pool: {
		max: config.pool.max,
		min: config.pool.min,
		acquire: config.pool.acquire,
		idle: config.pool.idle,
	},
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('./users.model')(sequelize, Sequelize);
db.basicProfile = require('./basicProfile.model')(sequelize, Sequelize);


// db.subscriptionPayment.hasOne(db.subscription, {sourceKey: 'subscriptionId', foreignKey: 'id'});
// db.faq_heading.hasMany(db.faq_answer, {sourceKey: 'id', foreignKey: 'faq_heading_id'});


module.exports = db;
