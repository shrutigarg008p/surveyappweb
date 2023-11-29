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
db.redemptionMode = require('./redemptionMode.model')(sequelize, Sequelize);
db.redemptionRequest = require('./RedemptionRequests.model')(sequelize, Sequelize);
db.countries = require('./countries.model')(sequelize, Sequelize);
db.states = require('./states.model')(sequelize, Sequelize);
db.city = require('./city.model')(sequelize, Sequelize);
db.rewards = require('./Rewards.model')(sequelize, Sequelize);
db.referrals = require('./Referral.model')(sequelize, Sequelize);
db.partners = require('./Partners.model')(sequelize, Sequelize);
db.labels = require('./Labels.model')(sequelize, Sequelize);
db.marketingLinks = require('./MarketingLinks.model')(sequelize, Sequelize);
db.sec = require('./Sec.model')(sequelize, Sequelize);
db.profiles = require('./ProfileManagement.model')(sequelize, Sequelize);
db.questions = require('./Questions.model')(sequelize, Sequelize);
db.options = require('./Options.model')(sequelize, Sequelize);
db.secQuestions = require('./SecQuestions.model')(sequelize, Sequelize);
db.surveys = require('./surveys.models')(sequelize, Sequelize);
db.blacklistedSurveys = require('./blackListedSurveys.model')(sequelize, Sequelize);
db.sample = require('./Samples.model')(sequelize, Sequelize);
db.sampleQuestions = require('./SampleQuestions.model')(sequelize, Sequelize);



// db.subscriptionPayment.hasOne(db.subscription, {sourceKey: 'subscriptionId', foreignKey: 'id'});
// db.faq_heading.hasMany(db.faq_answer, {sourceKey: 'id', foreignKey: 'faq_heading_id'});


module.exports = db;
