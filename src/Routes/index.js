module.exports=(app)=> {
	require('./user.route')(app);
	require('./redemption.route')(app);
	require('./countries.route')(app);
};
