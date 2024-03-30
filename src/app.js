const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.PORT || 9001;
require('dotenv').config();
const { startScheduledEmailsCronJob } = require('./utils/CronJobs');

startScheduledEmailsCronJob();

app.use(cors());
app.use(
	bodyParser.urlencoded({
		limit: '200mb',
		extended: true,
		parameterLimit: 1000000,
	}),
);
app.use(bodyParser.json({limit: '200mb'}));
//const http = require('http');

const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/indiapolls.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/indiapolls.com/fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

//const httpsServer = http.createServer(app);
 const httpsServer = https.createServer(credentials, app);

// log all incoming request
app.use((req, res, next) => {
	// console.log("appbody=====>>",req)
	next();
});

app.use('/Images', express.static(path.join(__dirname, 'Public/Images')));

const db = require('../src/models');
db.sequelize.sync();

require('./Routes')(app);

const jsn = {Status: 'Your Server Is Started Now'};
app.get('/*', (req, res) => {
	res.send(jsn);
	res.send('hello');
	// res.sendFile(__dirname + '/index.html');
});

httpsServer.listen(port, function() {
	console.log('Server started Port', port);
});
