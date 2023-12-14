const nodemailer = require('nodemailer');

const moment = require('moment');
const senderAddress = `Survey <survey@gmail.com>`;


const transporter = nodemailer.createTransport({
	host: 'smtp-relay.brevo.com',
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: 'softpk@gmail.com', // your email
		pass: '4Vc6kUwJ8F7rp30C' // your email password or app password
	}
});


module.exports = {
	userRegistration: (email, token) => {
		console.log('logIn_Mail====>' + email);
		const mailOptions = {
			from: 'softpk@gmail.com',
			to: email,
			subject: 'IndiaPolls-Your Registration is Pending Approval',
			text: 'IndiaPolls-Your Registration is Pending Approval',
			html: '<p><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;background:rgb(255,255,255);">Welcome to IndiaPolls !&nbsp;</span></strong></p>\n' +
				'\t\t\t\t<p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">&nbsp;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">India&apos;s exclusive survey portal that helps voice your honest and truthful opinions on a variety of subjects - whether it is about your favourite brands, or any latest gadget or any hot issue... we&nbsp;</span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;background:rgb(255,255,255);">PAY</span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">&nbsp;you for your valuable inputs and help companies, to create great products in return for us and for our Society&hellip;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">With each Survey, you earn attractive reward points as you complete them. You can encash these points for a host of reward mechanisms. Including Vouchers from Amazon or FlipKart or Paytm cash.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I am Kumar, responsible for managing this great panel community. I am excited to welcome you as our latest member into our vast panel community and truly hope that you have a mesmerizing experience in the onward journey. I will also help you get familiar with our website, our incentives program and surveys that you can take every now and then and earn rewards.&nbsp;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Please feel free to contact me in case of any questions, comments or feedback.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;background:rgb(255,255,255);">Right now, to complete your registration process, please click on the link below:</span></strong><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;"><br></span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:16px;"><br></span><a href="https://indiapolls.com/#/auth/confirmed-email?email='+email+'&token='+token+'"><u><span style="font-family:Arial;color:rgb(0,0,255);text-decoration:underline;font-size:16px;background:rgb(255,255,255);">Confirm Email</span></u></a><span style="font-family:Arial;color:rgb(0,0,0);font-size:16px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Once you have activated your membership you will be eligible to participate in surveys and earn rewards. There is absolutely no catch. Your membership is absolutely free and your personal data will never be shared with any of our business associates. It will only be used for shortlisting of surveys personally for you.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I look forward to your active participation. Once again - welcome onboard - I am sure you will have a great time here.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Your poll helps India Poll !</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;"><br></span></strong><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;background:rgb(255,255,0);">\n' +
				'                  \n' +
				'                  <img src="https://indiapolls.com:9000/Images/logo.jpeg" alt="IndiaPolls" width="50" height="40">\n' +
				'                  \n' +
				'                  </span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Kumar,</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">IndiaPolls - Panel Manager</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">If you are unable to access the URL address or do not want to receive any further correspondence from IndiaPolls, please send us an email at</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">unsubscribe@IndiaPolls.com.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">By confirming your registration and activating your membership you agree to IndiaPolls&apos; Terms and Conditions. You also agree to receive invitations to participate in market research surveys. Please visit our website to go through our terms and conditions. You are receiving this email because you have registered to be a member of IndiaPolls. We may send a follow-up e-mail if you do not activate your account within 7 days. If you no longer wish to be a member of our panel, please reply to this e-mail with &quot;unsubscribe&quot; in the subject line.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">NOTE: This email was automatically generated from IndiaPolls (http://indiapolls.com).</span></p>',

		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},

	surveyInvite: (subject, email, template) => {
		console.log('logIn_Mail====>' + email);
		const mailOptions = {
			from: 'softpk@gmail.com',
			to: email,
			subject: subject,
			html: template
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	}
}




// https://IndiaPolls.net/Accounts/VerifyEmail?email='+email+'&token='+token+'
