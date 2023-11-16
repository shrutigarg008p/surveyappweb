module.exports=(app)=> {
	require('./user.route')(app);
	require('./redemption.route')(app);
	require('./countries.route')(app);
	require('./RedemptionRequest.route')(app);
	require('./Rewards.route')(app);
	require('./Referrals.route')(app);
	require('./Partners.route')(app);
	require('./Lables.route')(app);
	require('./MarketingLinks.route')(app);
	require('./Sec.route')(app);
};
