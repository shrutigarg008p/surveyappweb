-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;
-- public."Options" definition

-- Drop table

-- DROP TABLE public."Options";

CREATE TABLE public."Options" (
	id int4 NOT NULL,
	questionid int4 NOT NULL,
	value varchar NULL,
	hint varchar NULL,
	displayorder int4 NOT NULL,
	isactive bit(1) NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public."__MigrationHistory" definition

-- Drop table

-- DROP TABLE public."__MigrationHistory";

CREATE TABLE public."__MigrationHistory" (
	migrationid varchar(150) NULL,
	contextkey varchar(300) NULL,
	model bytea NOT NULL,
	productversion varchar(32) NULL
);


-- public.applicationuserlabels definition

-- Drop table

-- DROP TABLE public.applicationuserlabels;

CREATE TABLE public.applicationuserlabels (
	applicationuser_id int4 NOT NULL,
	label_id int4 NOT NULL
);


-- public.aspnetroles definition

-- Drop table

-- DROP TABLE public.aspnetroles;

CREATE TABLE public.aspnetroles (
	id int4 NOT NULL,
	"name" varchar(256) NULL
);


-- public.aspnetuserclaims definition

-- Drop table

-- DROP TABLE public.aspnetuserclaims;

CREATE TABLE public.aspnetuserclaims (
	id int4 NOT NULL,
	userid int4 NOT NULL,
	claimtype varchar NULL,
	claimvalue varchar NULL
);


-- public.aspnetuserlogins definition

-- Drop table

-- DROP TABLE public.aspnetuserlogins;

CREATE TABLE public.aspnetuserlogins (
	loginprovider varchar(128) NULL,
	providerkey varchar(128) NULL,
	userid int4 NOT NULL
);


-- public.aspnetuserroles definition

-- Drop table

-- DROP TABLE public.aspnetuserroles;

CREATE TABLE public.aspnetuserroles (
	userid int4 NOT NULL,
	roleid int4 NOT NULL
);


-- public.aspnetusers definition

-- Drop table

-- DROP TABLE public.aspnetusers;

CREATE TABLE public.aspnetusers (
	id int4 NOT NULL,
	deleterequestdate timestamp NULL,
	deleteconfirmdate timestamp NULL,
	phonenumber varchar(150) NULL,
	email varchar(256) NULL,
	emailconfirmed bit(1) NOT NULL,
	passwordhash varchar NULL,
	securitystamp varchar NULL,
	phonenumberconfirmed bit(1) NOT NULL,
	twofactorenabled bit(1) NOT NULL,
	lockoutenddateutc timestamp NULL,
	lockoutenabled bit(1) NOT NULL,
	accessfailedcount int4 NOT NULL,
	username varchar(256) NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	activestatus int4 NOT NULL,
	signupip varchar NULL,
	lastupdatedprofileid int4 NULL,
	unsubscribedate timestamp NULL,
	unsubscriberequestdate timestamp NULL,
	legacyuserid int4 NULL,
	legacypassword varchar NULL,
	legacyerror varchar NULL,
	registereddate timestamp NULL
);


-- public.basicprofiles definition

-- Drop table

-- DROP TABLE public.basicprofiles;

CREATE TABLE public.basicprofiles (
	userid int4 NOT NULL,
	firstname varchar NOT NULL,
	lastname varchar NOT NULL,
	gender bit(1) NOT NULL,
	mobile varchar NOT NULL,
	dateofbirth timestamp NOT NULL,
	referralsource varchar NOT NULL,
	addressline1 varchar NOT NULL,
	addressline2 varchar NULL,
	country int4 NOT NULL,
	state int4 NOT NULL,
	city int4 NOT NULL,
	pincode varchar NOT NULL,
	acceptterms bit(1) NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	registrationip varchar NULL,
	imagepath varchar NULL
);


-- public.cities definition

-- Drop table

-- DROP TABLE public.cities;

CREATE TABLE public.cities (
	id int4 NOT NULL,
	stateid int4 NOT NULL,
	"name" varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	tier int4 NOT NULL
);


-- public.clients definition

-- Drop table

-- DROP TABLE public.clients;

CREATE TABLE public.clients (
	id varchar(128) NULL,
	secret varchar NOT NULL,
	"name" varchar(100) NULL,
	applicationtype int4 NOT NULL,
	active bit(1) NOT NULL,
	refreshtokenlifetime int4 NOT NULL,
	allowedorigin varchar(100) NULL
);


-- public.countries definition

-- Drop table

-- DROP TABLE public.countries;

CREATE TABLE public.countries (
	id int4 NOT NULL,
	"name" varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.jobstatus definition

-- Drop table

-- DROP TABLE public.jobstatus;

CREATE TABLE public.jobstatus (
	id int4 NOT NULL,
	"Key" varchar NULL,
	laststartedat timestamp NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.labels definition

-- Drop table

-- DROP TABLE public.labels;

CREATE TABLE public.labels (
	id int4 NOT NULL,
	"name" varchar NOT NULL,
	description varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.log definition

-- Drop table

-- DROP TABLE public.log;

CREATE TABLE public.log (
	id int4 NOT NULL,
	"Date" timestamp NOT NULL,
	thread varchar(255) NULL,
	"Level" varchar(50) NULL,
	logger varchar(255) NULL,
	message varchar NOT NULL,
	"Exception" varchar NOT NULL
);


-- public.marketinglinkreferrals definition

-- Drop table

-- DROP TABLE public.marketinglinkreferrals;

CREATE TABLE public.marketinglinkreferrals (
	id int4 NOT NULL,
	userid int4 NOT NULL,
	marketinglinkid int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.marketinglinks definition

-- Drop table

-- DROP TABLE public.marketinglinks;

CREATE TABLE public.marketinglinks (
	id int4 NOT NULL,
	"name" varchar NOT NULL,
	description varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	clicks int4 NOT NULL
);


-- public.messages definition

-- Drop table

-- DROP TABLE public.messages;

CREATE TABLE public.messages (
	id int4 NOT NULL,
	userid int4 NOT NULL,
	querytype int4 NOT NULL,
	subject varchar NULL,
	body varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	querystatus int4 NOT NULL
);


-- public.newsletters definition

-- Drop table

-- DROP TABLE public.newsletters;

CREATE TABLE public.newsletters (
	id int4 NOT NULL,
	"name" varchar NULL,
	subject varchar NULL,
	body varchar NULL,
	emails varchar NULL,
	senddate timestamp NOT NULL,
	createdbyid int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	newsletterstatus int4 NOT NULL,
	emailscreatedat timestamp NULL
);


-- public.newslettersamples definition

-- Drop table

-- DROP TABLE public.newslettersamples;

CREATE TABLE public.newslettersamples (
	newsletter_id int4 NOT NULL,
	sample_id int4 NOT NULL
);


-- public.partners definition

-- Drop table

-- DROP TABLE public.partners;

CREATE TABLE public.partners (
	id int4 NOT NULL,
	"name" varchar NULL,
	description varchar NULL,
	successurl varchar NULL,
	overquotaurl varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	disqualifiedurl varchar NULL
);


-- public.profiles definition

-- Drop table

-- DROP TABLE public.profiles;

CREATE TABLE public.profiles (
	id int4 NOT NULL,
	"name" varchar NULL,
	description varchar NULL,
	displayorder int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.questions definition

-- Drop table

-- DROP TABLE public.questions;

CREATE TABLE public.questions (
	id int4 NOT NULL,
	profileid int4 NOT NULL,
	"Text" varchar NULL,
	hint varchar NULL,
	displayorder int4 NOT NULL,
	isactive bit(1) NOT NULL,
	displaytype int4 NOT NULL,
	"DataType" int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.redemptionmodes definition

-- Drop table

-- DROP TABLE public.redemptionmodes;

CREATE TABLE public.redemptionmodes (
	id int4 NOT NULL,
	"name" varchar NULL,
	description varchar NULL,
	minimumpoints int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	usename bit(1) NOT NULL,
	usephone bit(1) NOT NULL,
	useaddress bit(1) NOT NULL
);


-- public.redemptionrequestdetails definition

-- Drop table

-- DROP TABLE public.redemptionrequestdetails;

CREATE TABLE public.redemptionrequestdetails (
	redemptionrequestid int4 NOT NULL,
	"name" varchar NULL,
	phonenumber varchar NULL,
	address1 varchar NULL,
	address2 varchar NULL,
	city varchar NULL,
	state varchar NULL,
	country varchar NULL,
	pincode varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.redemptionrequests definition

-- Drop table

-- DROP TABLE public.redemptionrequests;

CREATE TABLE public.redemptionrequests (
	id int4 NOT NULL,
	userid int4 NOT NULL,
	redemptionmodeid int4 NOT NULL,
	requestdate timestamp NOT NULL,
	pointsrequested int4 NOT NULL,
	pointsredeemed int4 NOT NULL,
	redemptionrequeststatus int4 NOT NULL,
	notes varchar NULL,
	redemptiondate timestamp NULL,
	cancellationdate timestamp NULL,
	indiaspeaksnotes varchar NULL,
	approvedbyid int4 NULL,
	cancelledbyid int4 NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.referralemails definition

-- Drop table

-- DROP TABLE public.referralemails;

CREATE TABLE public.referralemails (
	id int4 NOT NULL,
	referralid int4 NOT NULL,
	actualsenddate timestamp NULL,
	attempts int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.referrals definition

-- Drop table

-- DROP TABLE public.referrals;

CREATE TABLE public.referrals (
	id int4 NOT NULL,
	userid int4 NOT NULL,
	"name" varchar NULL,
	email varchar(400) NULL,
	phonenumber varchar NULL,
	referralstatus int4 NOT NULL,
	referralmethod int4 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	referreduserid int4 NULL,
	approvaldate timestamp NULL,
	cancellationdate timestamp NULL,
	approvedbyid int4 NULL,
	cancelledbyid int4 NULL
);


-- public.refreshtokens definition

-- Drop table

-- DROP TABLE public.refreshtokens;

CREATE TABLE public.refreshtokens (
	id varchar(128) NULL,
	subject varchar(50) NULL,
	clientid varchar(50) NULL,
	issuedutc timestamp NOT NULL,
	expiresutc timestamp NOT NULL,
	protectedticket varchar NOT NULL
);


-- public.rewards definition

-- Drop table

-- DROP TABLE public.rewards;

CREATE TABLE public.rewards (
	id int4 NOT NULL,
	userid int4 NOT NULL,
	rewarddate timestamp NOT NULL,
	points int4 NOT NULL,
	rewardtype int4 NOT NULL,
	surveyid int4 NULL,
	referralid int4 NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	rewardstatus int4 NOT NULL,
	revokedate timestamp NULL,
	revokedbyid int4 NULL,
	grantedbyid int4 NULL,
	sweepstakeid int4 NULL
);


-- public.samplequestions definition

-- Drop table

-- DROP TABLE public.samplequestions;

CREATE TABLE public.samplequestions (
	id int4 NOT NULL,
	sampleid int4 NOT NULL,
	questionid int4 NOT NULL,
	value varchar NULL,
	operand int4 NOT NULL,
	optionids varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.samples definition

-- Drop table

-- DROP TABLE public.samples;

CREATE TABLE public.samples (
	id int4 NOT NULL,
	"name" varchar NULL,
	description varchar NULL,
	isactive bit(1) NOT NULL,
	profilecount int4 NOT NULL,
	lastcheckdate timestamp NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	gender bit(1) NULL,
	fromage int4 NULL,
	toage int4 NULL,
	fromregistrationdate timestamp NULL,
	toregistrationdate timestamp NULL,
	stateids varchar NULL,
	cityids varchar NULL,
	tierids varchar NULL,
	secids varchar NULL
);


-- public.samplesurveyemailschedules definition

-- Drop table

-- DROP TABLE public.samplesurveyemailschedules;

CREATE TABLE public.samplesurveyemailschedules (
	sample_id int4 NOT NULL,
	surveyemailschedule_id int4 NOT NULL
);


-- public.secquestions definition

-- Drop table

-- DROP TABLE public.secquestions;

CREATE TABLE public.secquestions (
	id int4 NOT NULL,
	socioeconomicclassificationid int4 NOT NULL,
	questionid int4 NOT NULL,
	operand int4 NOT NULL,
	optionids varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.settings definition

-- Drop table

-- DROP TABLE public.settings;

CREATE TABLE public.settings (
	id int4 NOT NULL,
	sendsurveyemail bit(1) NOT NULL,
	sendnewsletteremail bit(1) NOT NULL,
	runsweepstakesautomatically bit(1) NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	sendreferralemail bit(1) NOT NULL
);


-- public.socioeconomicclassifications definition

-- Drop table

-- DROP TABLE public.socioeconomicclassifications;

CREATE TABLE public.socioeconomicclassifications (
	id int4 NOT NULL,
	"name" varchar NULL,
	description varchar NULL,
	isactive bit(1) NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.states definition

-- Drop table

-- DROP TABLE public.states;

CREATE TABLE public.states (
	id int4 NOT NULL,
	countryid int4 NOT NULL,
	"name" varchar NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.surveyallocations definition

-- Drop table

-- DROP TABLE public.surveyallocations;

CREATE TABLE public.surveyallocations (
	surveyid int4 NOT NULL,
	userid int4 NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	survey_id int4 NULL,
	attemptstatus int4 NOT NULL,
	startdatetime timestamp NULL,
	finishdatetime timestamp NULL,
	id int4 NOT NULL,
	rejectedbyid int4 NULL,
	rejectiondate timestamp NULL,
	grantedbyid int4 NULL,
	points int4 NOT NULL,
	usertype int4 NOT NULL,
	useridentifier varchar NULL,
	partnerid int4 NULL,
	ipaddress varchar NULL
);


-- public.surveyblacklistentities definition

-- Drop table

-- DROP TABLE public.surveyblacklistentities;

CREATE TABLE public.surveyblacklistentities (
	surveyid int4 NOT NULL,
	blacklistsurveyid int4 NOT NULL,
	survey_id int4 NULL
);


-- public.surveyemailschedules definition

-- Drop table

-- DROP TABLE public.surveyemailschedules;

CREATE TABLE public.surveyemailschedules (
	id int4 NOT NULL,
	surveyid int4 NOT NULL,
	surveytemplateid int4 NOT NULL,
	count int4 NOT NULL,
	issendall bit(1) NOT NULL,
	scheduledate timestamp NOT NULL,
	scheduletype int4 NOT NULL,
	schedulestatus int4 NOT NULL,
	baseemailscheduleid int4 NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	emailscreatedat timestamp NULL
);


-- public.surveypartners definition

-- Drop table

-- DROP TABLE public.surveypartners;

CREATE TABLE public.surveypartners (
	survey_id int4 NOT NULL,
	partner_id int4 NOT NULL
);


-- public.surveys definition

-- Drop table

-- DROP TABLE public.surveys;

CREATE TABLE public.surveys (
	id int4 NOT NULL,
	"name" varchar NULL,
	company varchar NULL,
	description varchar NULL,
	isactive bit(1) NOT NULL,
	url varchar NULL,
	ceggpoints int4 NOT NULL,
	publishdate timestamp NOT NULL,
	expirydate timestamp NULL,
	userlimitcutoff int4 NOT NULL,
	userlimitcommitted int4 NOT NULL,
	surveytype int4 NOT NULL,
	pointallocationtype int4 NOT NULL,
	client varchar NULL,
	surveylength int4 NOT NULL,
	companylogo varchar NULL,
	outliercutofftime int4 NOT NULL,
	costperinterview float8 NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	minimuminterviewduration int4 NOT NULL,
	useuniquelinks bit(1) NOT NULL,
	closedate timestamp NULL,
	ipunique bit(1) NOT NULL,
	legacyid int4 NULL,
	surveyurlidentifier varchar NULL,
	ispaused bit(1) NOT NULL
);


-- public.surveytemplates definition

-- Drop table

-- DROP TABLE public.surveytemplates;

CREATE TABLE public.surveytemplates (
	id int4 NOT NULL,
	surveyid int4 NOT NULL,
	body varchar NULL,
	isactive bit(1) NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL,
	"name" varchar NULL,
	subject varchar NULL
);


-- public.sweepstakes definition

-- Drop table

-- DROP TABLE public.sweepstakes;

CREATE TABLE public.sweepstakes (
	id int4 NOT NULL,
	"name" varchar NULL,
	sweepstakedate timestamp NOT NULL,
	approvaldate timestamp NULL,
	approvedbyid int4 NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);


-- public.sweepstakewinners definition

-- Drop table

-- DROP TABLE public.sweepstakewinners;

CREATE TABLE public.sweepstakewinners (
	id int4 NOT NULL,
	sweepstakeid int4 NOT NULL,
	userid int4 NOT NULL,
	ismegawinner bit(1) NOT NULL,
	createdat timestamp NOT NULL,
	updatedat timestamp NOT NULL,
	deletedat timestamp NULL
);