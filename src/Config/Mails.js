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
			subject: 'Dataxing-Your Registration is Pending Approval',
			text: 'Dataxing-Your Registration is Pending Approval',
			html: '<p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Welcome to Dataxing - India&apos;s premier survey portal that helps you voice your honest opinion on a variety of subjects - whether about your favourite brands, or a hot issue... and we PAY you for doing that!</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Now speak up at your convenience and earn attractive reward points as you complete surveys. You can encash these points or donate them to a charity of your choice.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I am&nbsp;Tanya&nbsp;Basu, responsible for managing the panel community. I am excited to welcome you as the latest member of our panel and hope you have a great time here. I will also help you get familiar with our website, our incentives program and surveys that you can take here. Feel free to contact me in case of any questions, comments or feedback.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Right now, to complete your registration process, please click on the link below:</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><a href="http://localhost:3000/#/auth/confirmed-email?email='+email+'&token='+token+'"><u><span style="font-family:Arial;color:rgb(0,0,255);text-decoration:underline;font-size:13px;background:rgb(255,255,255);">Confirm Email</span></u></a><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Once you have activated your membership you will be eligible to participate in surveys and earn rewards. There is no catch. Your membership is absolutely free and your personal data will never be shared with any of our business associates. It will only be used to shortlist you for surveys.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I look forward to your active participation. Once again - welcome onboard - I am sure you will have a great time here.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">You speak, India Speaks!</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Tanya&nbsp;Basu</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Dataxing Community Relations Manager</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">If you are unable to access the URL address or do not want to receive any further correspondence from Dataxing, please send us an email at</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">unsubscribe@dataxing.net.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">By confirming your registration and activating your membership you agree to Dataxing&apos; Terms and Conditions. You also agree to receive invitations to participate in market research surveys. Please visit our website to go through our terms and conditions. You are receiving this because you have registered to be a member of Dataxing. We may send a follow-up e-mail if you do not activate your account within 7 days. If you no longer wish to be a member of our panel, please reply to this e-mail with &quot;unsubscribe&quot; in the subject line.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">NOTE: This email was automatically generated from Dataxing (http://dataxing.net).</span></p>\n' +
				'<p><br></p>'
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




// https://dataxing.net/Accounts/VerifyEmail?email='+email+'&token='+token+'
