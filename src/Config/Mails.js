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
			from: 'panel@indiapolls.com',
			to: email,
			subject: 'IndiaPolls-Your Registration is Pending Approval',
			text: 'IndiaPolls-Your Registration is Pending Approval',
			html: '<p><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;background:rgb(255,255,255);">Welcome to IndiaPolls !&nbsp;</span></strong></p>\n' +
				'\t\t\t\t<p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">&nbsp;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">India&apos;s exclusive survey portal that helps voice your honest and truthful opinions on a variety of subjects - whether it is about your favourite brands, or any latest gadget or any hot issue... we&nbsp;</span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;background:rgb(255,255,255);">PAY</span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">&nbsp;you for your valuable inputs and help companies, to create great products in return for us and for our Society&hellip;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">With each Survey, you earn attractive reward points as you complete them. You can encash these points for a host of reward mechanisms. Including Vouchers from Amazon or FlipKart or Paytm cash.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I am Kumar, responsible for managing this great panel community. I am excited to welcome you as our latest member into our vast panel community and truly hope that you have a mesmerizing experience in the onward journey. I will also help you get familiar with our website, our incentives program and surveys that you can take every now and then and earn rewards.&nbsp;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Please feel free to contact me in case of any questions, comments or feedback.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;background:rgb(255,255,255);">Right now, to complete your registration process, please click on the link below:</span></strong><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;"><br></span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:16px;"><br></span><a href="https://panel.indiapolls.com/#/auth/confirmed-email?email='+email+'&token='+token+'"><u><span style="font-family:Arial;color:rgb(0,0,255);text-decoration:underline;font-size:16px;background:rgb(255,255,255);">Confirm Email</span></u></a><span style="font-family:Arial;color:rgb(0,0,0);font-size:16px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Once you have activated your membership you will be eligible to participate in surveys and earn rewards. There is absolutely no catch. Your membership is absolutely free and your personal data will never be shared with any of our business associates. It will only be used for shortlisting of surveys personally for you.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I look forward to your active participation. Once again - welcome onboard - I am sure you will have a great time here.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Your poll helps India Poll !</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;"><br></span></strong><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;background:rgb(255,255,0);">\n' +
				'                  \n' +
				'                  <img src="https://indiapolls.com:9000/Images/logo-black.png" alt="IndiaPolls" width="50" height="40">\n' +
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


	userRegistrationHindi: (email, token) => {
		console.log('logIn_Mail====>' + email);
		const mailOptions = {
			from: 'panel@indiapolls.com',
			to: email,
			subject: 'इंडियापोल्स-आपका पंजीकरण अनुमोदन के लिए लंबित है',
			text: 'इंडियापोल्स-आपका पंजीकरण अनुमोदन के लिए लंबित है',
			html: '<p>इंडियापोल्स में आपका स्वागत है!</p><p>भारत का श्रेष्ठ सर्वेक्षण पोर्टल जो विभिन्न विषयों पर आपकी ईमानदार और सच्ची राय व्यक्त करने में मदद करता है - चाहे वह आपके पसंदीदा ब्रांड के बारे में हो, या किसी नवीनतम और आधुनिक गैजेट या किसी चर्चित मुद्दे के बारे में। हम आपको आपके मूल्यवान राय के लिए भुगतान करते हैं और साथ में कंपनियों को हमारे और हमारे समाज के लिए बेहतर उत्पाद बनाने में मदद करते हैं।</p><p>प्रत्येक सर्वेक्षण को पूरा करने पर आप आकर्षक पुरस्कार अंक अर्जित करते हैं। आप कई दूसरे पुरस्कारो के लिए अपने अर्जित अंक भुना सकते हैं। जिसमें Amazon या Flipkart या Paytm कैश के वाउचर भी शामिल हैं।</p><p>मैं कुमार हूं, इस महान पैनल समुदाय के व्यवस्था के लिए जिम्मेदार हूं। मैं हमारे विशाल पैनल समुदाय में हमारे नवीनतम सदस्य के रूप में आपका स्वागत करने के लिए उत्साहित हूं और वास्तव में आशा करता हूं कि आगे की यात्रा में आपको एक सुखद एवं लाभान्वित अनुभव होगा। मैं आपको हमारी वेबसाइट, हमारे प्रोत्साहन कार्यक्रम और सर्वेक्षणों से परिचित होने में भी मदद करूंगा, जिन्हें आप समय-समय पर ले सकते हैं और पुरस्कार अर्जित कर सकते हैं।</p><p>किसी भी प्रश्न, टिप्पणी या प्रतिक्रिया के मामले में कृपया निःसंकोच मुझसे संपर्क करें।</p><p>अभी, अपनी पंजीकरण प्रक्रिया पूरी करने के लिए कृपया नीचे दिए गए लिंक पर क्लिक करें:</p><p><a href="https://panel.indiapolls.com/#/auth/confirmed-email?email=email&token=token">ईमेल की पुष्टि करें</a></p><p>एक बार जब आप अपनी सदस्यता सक्रिय कर लेंगे तो आप सर्वेक्षण में भाग लेने और पुरस्कार अर्जित करने के उपयुक्त होंगे। आपकी सदस्यता बिल्कुल मुफ़्त है और आपका व्यक्तिगत डेटा कभी भी हमारे किसी भी व्यावसायिक सहयोगी के साथ साझा नहीं किया जाएगा। इसका उपयोग केवल आपके लिए व्यक्तिगत रूप से सर्वेक्षणों को चयन करने के लिए किया जाएगा।</p><p>मैं आपकी सक्रिय भागीदारी की आशा करता हूँ। एक बार फिर इंडियापोल्स पर आपका स्वागत है। मुझे यकीन है कि आप यहां बहुत अच्छा समय बिताएंगे।</p><p>आपका पोल इंडियापोल्स में मदद करता है!</p><p>सादर आभार</p><p>कुमार,<br>इंडियापोल्स - पैनल मैनेजर</p><p>यदि आप यूआरएल पते तक पहुंचने में असमर्थ हैं या इंडियापोल्स से कोई और आप भविष्य में इस प्रकार का ईमेल प्राप्त नहीं करना चाहते हैं, तो कृपया सदस्यता समाप्त कर दें, हमें यहां एक ईमेल भेजें unsubscribe@IndiaPolls.com.</p><p>अपने पंजीकरण की पुष्टि करके और अपनी सदस्यता सक्रिय करके आप इंडियापोल्स के नियमों और शर्तों से सहमत हैं। आप मार्केट रिसर्च सर्वे में भाग लेने के लिए निमंत्रण प्राप्त करने के लिए भी सहमत हैं। कृपया हमारे नियम और शर्तें जानने के लिए हमारी वेबसाइट पर जाएँ। आपको यह ईमेल इसलिए प्राप्त हो रहा है क्योंकि आपने इंडियापोल्स के सदस्य बनने के लिए पंजीकरण कराया है। यदि आप 7 दिनों के भीतर अपना खाता सक्रिय नहीं करते हैं तो हम एक उपयुक्त ई-मेल भेज सकते हैं। यदि आप अब हमारे पैनल का सदस्य नहीं रहना चाहते हैं, तो कृपया इस ई-मेल का उत्तर विषय पंक्ति में "सदस्यता समाप्त करें" लिखकर दें।</p><p>नोट: यह ईमेल इंडियापोल्स (http://indiapolls.com) से स्वचालित रूप से जेनरेट किया गया था।</p>',

		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(info));
				return true;
			}
		});
	},



	userEmailChanged: (email, token) => {
		console.log('logIn_Mail====>' + email);
		const mailOptions = {
			from: 'panel@indiapolls.com',
			to: email,
			subject: 'IndiaPolls-Your Email Change Confirmation Pending',
			text: 'IndiaPolls-Your Email Change Confirmation Pending',
			html: '<p><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;background:rgb(255,255,255);">Welcome to IndiaPolls !&nbsp;</span></strong></p>\n' +
				'\t\t\t\t<p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">&nbsp;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">India&apos;s exclusive survey portal that helps voice your honest and truthful opinions on a variety of subjects - whether it is about your favourite brands, or any latest gadget or any hot issue... we&nbsp;</span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;background:rgb(255,255,255);">PAY</span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">&nbsp;you for your valuable inputs and help companies, to create great products in return for us and for our Society&hellip;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">With each Survey, you earn attractive reward points as you complete them. You can encash these points for a host of reward mechanisms. Including Vouchers from Amazon or FlipKart or Paytm cash.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I am Kumar, responsible for managing this great panel community. I am excited to welcome you as our latest member into our vast panel community and truly hope that you have a mesmerizing experience in the onward journey. I will also help you get familiar with our website, our incentives program and surveys that you can take every now and then and earn rewards.&nbsp;</span></p><p><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Please feel free to contact me in case of any questions, comments or feedback.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;background:rgb(255,255,255);">Right now, to complete your change email confirmation, please click on the link below:</span></strong><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:16px;"><br></span></strong><span style="font-family:Arial;color:rgb(0,0,0);font-size:16px;"><br></span><a href="https://panel.indiapolls.com/#/auth/confirmed-email?email='+email+'&token='+token+'"><u><span style="font-family:Arial;color:rgb(0,0,255);text-decoration:underline;font-size:16px;background:rgb(255,255,255);">Confirm Email</span></u></a><span style="font-family:Arial;color:rgb(0,0,0);font-size:16px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Once you have activated your membership you will be eligible to participate in surveys and earn rewards. There is absolutely no catch. Your membership is absolutely free and your personal data will never be shared with any of our business associates. It will only be used for shortlisting of surveys personally for you.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">I look forward to your active participation. Once again - welcome onboard - I am sure you will have a great time here.</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;background:rgb(255,255,255);">Your poll helps India Poll !</span><span style="font-family:Arial;color:rgb(0,0,0);font-size:13px;"><br></span><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;"><br></span></strong><strong><span style="font-family:Arial;color:rgb(0,0,0);font-weight:bold;font-size:13px;background:rgb(255,255,0);">\n' +
				'                  \n' +
				'                  <img src="https://indiapolls.com:9000/Images/logo-black.png" alt="IndiaPolls" width="50" height="40">\n' +
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

	userEmailChangedHindi: (email, token) => {
		console.log('logIn_Mail====>' + email);
		const mailOptions = {
			from: 'panel@indiapolls.com',
			to: email,
			subject: 'इंडियापोल्स-आपका ईमेल परिवर्तन पुष्टिकरण लंबित है',
			text: 'इंडियापोल्स-आपका ईमेल परिवर्तन पुष्टिकरण लंबित है',
			html: '<p>इंडियापोल्स में आपका स्वागत है!</p><p>भारत का श्रेष्ठ सर्वेक्षण पोर्टल जो विभिन्न विषयों पर आपकी ईमानदार और सच्ची राय व्यक्त करने में मदद करता है - चाहे वह आपके पसंदीदा ब्रांड के बारे में हो, या किसी नवीनतम और आधुनिक गैजेट या किसी चर्चित मुद्दे के बारे में। हम आपको आपके मूल्यवान राय के लिए भुगतान करते हैं और साथ में कंपनियों को हमारे और हमारे समाज के लिए बेहतर उत्पाद बनाने में मदद करते हैं।</p><p>प्रत्येक सर्वेक्षण को पूरा करने पर आप आकर्षक पुरस्कार अंक अर्जित करते हैं। आप कई दूसरे पुरस्कारो के लिए अपने अर्जित अंक भुना सकते हैं। जिसमें Amazon या Flipkart या Paytm कैश के वाउचर भी शामिल हैं।</p><p>मैं कुमार हूं, इस महान पैनल समुदाय के व्यवस्था के लिए जिम्मेदार हूं। मैं हमारे विशाल पैनल समुदाय में हमारे नवीनतम सदस्य के रूप में आपका स्वागत करने के लिए उत्साहित हूं और वास्तव में आशा करता हूं कि आगे की यात्रा में आपको एक सुखद एवं लाभान्वित अनुभव होगा। मैं आपको हमारी वेबसाइट, हमारे प्रोत्साहन कार्यक्रम और सर्वेक्षणों से परिचित होने में भी मदद करूंगा, जिन्हें आप समय-समय पर ले सकते हैं और पुरस्कार अर्जित कर सकते हैं।</p><p>किसी भी प्रश्न, टिप्पणी या प्रतिक्रिया के मामले में कृपया निःसंकोच मुझसे संपर्क करें।</p><p>अभी, अपनी पंजीकरण प्रक्रिया पूरी करने के लिए कृपया नीचे दिए गए लिंक पर क्लिक करें:</p><p><a href="https://panel.indiapolls.com/#/auth/confirmed-email?email=email&token=token">ईमेल की पुष्टि करें</a></p><p>एक बार जब आप अपनी सदस्यता सक्रिय कर लेंगे तो आप सर्वेक्षण में भाग लेने और पुरस्कार अर्जित करने के उपयुक्त होंगे। आपकी सदस्यता बिल्कुल मुफ़्त है और आपका व्यक्तिगत डेटा कभी भी हमारे किसी भी व्यावसायिक सहयोगी के साथ साझा नहीं किया जाएगा। इसका उपयोग केवल आपके लिए व्यक्तिगत रूप से सर्वेक्षणों को चयन करने के लिए किया जाएगा।</p><p>मैं आपकी सक्रिय भागीदारी की आशा करता हूँ। एक बार फिर इंडियापोल्स पर आपका स्वागत है। मुझे यकीन है कि आप यहां बहुत अच्छा समय बिताएंगे।</p><p>आपका पोल इंडियापोल्स में मदद करता है!</p><p>सादर आभार</p><p>कुमार,<br>इंडियापोल्स - पैनल मैनेजर</p><p>यदि आप यूआरएल पते तक पहुंचने में असमर्थ हैं या इंडियापोल्स से कोई और आप भविष्य में इस प्रकार का ईमेल प्राप्त नहीं करना चाहते हैं, तो कृपया सदस्यता समाप्त कर दें, हमें यहां एक ईमेल भेजें unsubscribe@IndiaPolls.com.</p><p>अपने पंजीकरण की पुष्टि करके और अपनी सदस्यता सक्रिय करके आप इंडियापोल्स के नियमों और शर्तों से सहमत हैं। आप मार्केट रिसर्च सर्वे में भाग लेने के लिए निमंत्रण प्राप्त करने के लिए भी सहमत हैं। कृपया हमारे नियम और शर्तें जानने के लिए हमारी वेबसाइट पर जाएँ। आपको यह ईमेल इसलिए प्राप्त हो रहा है क्योंकि आपने इंडियापोल्स के सदस्य बनने के लिए पंजीकरण कराया है। यदि आप 7 दिनों के भीतर अपना खाता सक्रिय नहीं करते हैं तो हम एक उपयुक्त ई-मेल भेज सकते हैं। यदि आप अब हमारे पैनल का सदस्य नहीं रहना चाहते हैं, तो कृपया इस ई-मेल का उत्तर विषय पंक्ति में "सदस्यता समाप्त करें" लिखकर दें।</p><p>नोट: यह ईमेल इंडियापोल्स (http://indiapolls.com) से स्वचालित रूप से जेनरेट किया गया था।</p>',

		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(info));
				return true;
			}
		});
	},

	surveyInvite: (subject, email, template) => {
		console.log('logIn_Mail====>' + email);
		const mailOptions = {
			from: 'panel@indiapolls.com',
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
	},


	userPasswordReset: (email, token) => {
		console.log('logIn_Mail====>' + email);
		const details = {
			from: 'panel@indiapolls.com', // sender address same as above
			to: email, // Receiver's email id
			subject: 'Regarding Password reset on INDIA-POLLS!', // Subject of the mail.
			html:
				`<div><span>Dear User,</span><div><p>Please follow the link below to reset your password.</p><br><p><a href='https://panel.indiapolls.com/#/reset-password/${token}'>Click here to reset password</a></p></p><br><p>Please do not share your password credentials with anyone and keep it stored safely.</p><br><p>Important: If this email is in your Spam folder mark it as "Not Spam" first. If you have any issue, please forward this email support@indiapolls.com</p><br></br>`, // Sending OTP
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},


	userPasswordResetHindi: (email, token) => {
		console.log('logIn_Mail====>' + email);
		const details = {
			from: 'panel@indiapolls.com', // sender address same as above
			to: email, // Receiver's email id
			subject: 'इंडियापोल्स पर पासवर्ड रीसेट के संबंध में!', // Subject of the mail.
			html:
				`<div><span>प्रिय उपयोगकर्ता,</span><div><p>कृपया अपना पासवर्ड रीसेट करने के लिए नीचे दिए गए लिंक पर क्लिक करे।</p><br><p><a href='https://panel.indiapolls.com/#/reset-password/${token}'>पासवर्ड रीसेट करने के लिए यहां क्लिक करें</a></p></p><br><p>कृपया अपना पासवर्ड क्रेडेंशियल किसी के साथ साझा न करें और इसे सुरक्षित रूप से संग्रहीत रखें।.</p><br><p>महत्वपूर्ण: यदि यह ईमेल आपके स्पैम फ़ोल्डर में है तो पहले इसे "स्पैम नहीं" के रूप में चिह्नित करें। यदि आपको कोई समस्या है, तो कृपया इस ईमेल support@indiapolls.com को अग्रेषित करें।</p><br></br>`, // Sending OTP
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},



	referralMail: (email, userId, subject, name, senderName) => {
		console.log('logIn_Mail====>' + email);
		const url = `https://panel.indiapolls.com/referrals/view/${userId}`
		const details = {
			from: 'panel@indiapolls.com', // sender address same as above
			to: email, // Receiver's email id
			subject: subject, // Subject of the mail.
			html: `<div id=":tc" class="a3s aiL "><div class="adM">
         </div><div><div class="adM">
        </div><p>
        Hi ${name}
        </p>
		<p>I am registered with a great service called <span class="il">IndiaPolls</span> - the website is <a href="https://panel.indiapolls.com" target="_blank"><span class="il">IndiaPolls</span>.com</a> where I spend a few minutes filling in surveys on interesting topics, and they pay me for doing this!</p> 
		<p>It is very simple - all you need to do is register, complete your profile and then take polls that they will send out to you from time to time via SMS/WhatsApp and Email. And that gives you a chance to earn rewards from INR 25 to INR 2500.</p>
		<p><strong>You also earn 25 IndiaPolls, I-Points whenever a person referred by you becomes a member.</strong></p>
		<p>You can either <strong>REDEEM</strong> your points or donate them to any charitable organization of your choice.</p>
		<p>All the surveys that we respond to are used by various companies to provide better products and services to customers like us - so your valuable opinion will always count!</p>
		<p>Once you register, do invite your friends too, and keep earning those I-Points.</p>
		<p>To join IndiaPolls and take paid surveys about the topics that matter to you, click on the link below:<br>
		<a href="https://panel.indiapolls.com/#/referrals/view/${userId}" target="_blank">https://test.<span class="il">indiaPolls</span>.com/<wbr>referrals/view/${userId}</a><br><br>
		<img alt="logo" src="https://indiapolls.com:9000/Images/logo-black.png" class="CToWUd" data-bit="iit">
		</p>
		<p>Please make sure you do register via this link so that my account gets updated.</p>
		<p>Thank you once again!<br>
		Best Regards,<br>
		${senderName}</p>`
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},

	referralMailHindi: (email, userId, subject, name, senderName) => {
		console.log('logIn_Mail====>' + email);
		const url = `https://panel.indiapolls.com/referrals/view/${userId}`
		const details = {
			from: 'panel@indiapolls.com',
			to: email,
			subject: subject,
			html: `<div id=":tc" class="a3s aiL "><div class="adM">
			</div><div><div class="adM">
			</div><p>
			नमस्ते ${name}
			</p>
			<p>मैं <span class="il">IndiaPolls</span> नामक एक शानदार सेवा के साथ पंजीकृत हूँ - वेबसाइट है <a href="https://panel.indiapolls.com" target="_blank"><span class="il">IndiaPolls</span>.com</a> जहाँ मैं कुछ मिनट दिलचस्प विषयों पर सर्वेक्षण भरने में बिताता हूँ, और वे मुझे इसके लिए भुगतान करते हैं!</p> 
			<p>यह बहुत सरल है - आपको केवल पंजीकरण करना है, अपनी प्रोफ़ाइल पूरी करनी है और फिर उन पोल्स में भाग लेना है जो वे समय-समय पर आपको SMS/WhatsApp और ईमेल के माध्यम से भेजेंगे। और इससे आपको INR 25 से INR 2500 तक के इनाम कमाने का मौका मिलता है।</p>
			<p><strong>जब भी आपके द्वारा संदर्भित कोई व्यक्ति सदस्य बनता है, तो आप भी 25 IndiaPolls, I-Points कमाते हैं।</strong></p>
			<p>आप अपने अंकों को या तो <strong>रिडीम</strong> कर सकते हैं या फिर अपनी पसंद की किसी भी धर्मार्थ संस्था को दान कर सकते हैं।</p>
			<p>हमारे द्वारा दिए गए सभी सर्वेक्षणों का उपयोग विभिन्न कंपनियाँ हम जैसे ग्राहकों को बेहतर उत्पाद और सेवाएँ प्रदान करने के लिए करती हैं - इसलिए आपकी अमूल्य राय हमेशा मायने रखेगी!</p>
			<p>एक बार जब आप पंजीकृत हो जाते हैं, तो अपने दोस्तों को भी आमंत्रित करें, और उन I-Points को कमाते रहें।</p>
			<p>आपके लिए महत्वपूर्ण विषयों पर भुगतान किए गए सर्वेक्षणों में भाग लेने के लिए IndiaPolls में शामिल होने के लिए, नीचे दिए गए लिंक पर क्लिक करें:<br>
			<a href="https://panel.indiapolls.com/#/referrals/view/${userId}" target="_blank">https://test.<span class="il">indiaPolls</span>.com/<wbr>referrals/view/${userId}</a><br><br>
			<img alt="logo" src="https://indiapolls.com:9000/Images/logo-black.png" class="CToWUd" data-bit="iit">
			</p>
			<p>कृपया सुनिश्चित करें कि आप इस लिंक के माध्यम से पंजीकरण करें ताकि मेरा खाता अपडेट हो सके।</p>
			<p>एक बार फिर धन्यवाद!<br>
			सादर,<br>
			${senderName}</p>`
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},


	manualRedemptionRequest: (name, email) => {
		console.log('logIn_Mail====>' + email);
		const details = {
			from: 'panel@indiapolls.com',
			to: email, // Receiver's email id
			subject: 'Amazon Gift Card Voucher Redemption Request',
			html:
				`<p>Dear ${name}</p>
				<p>Your amazon gift card will be delivered to you in 4 to 6 weeks from the date you submitted the request for redemption.</p>
				<p>IndiaPolls</p>
				<p>Kumar,<br />IndiaPolls - Panel Manager</p>`, // Sending OTP
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},

	manualRedemptionRequestHindi: (name, email) => {
		console.log('logIn_Mail====>' + email);
		const details = {
			from: 'panel@indiapolls.com',
			to: email, // Receiver's email id
			subject: 'अमेज़न उपहार कार्ड वाउचर मोचन अनुरोध',
			html:
				`<p>प्रिय ${name}</p>
				<p>आपका अमेज़ॅन उपहार कार्ड आपके द्वारा मोचन के लिए अनुरोध सबमिट करने की तारीख से 4 से 6 सप्ताह में आपको वितरित कर दिया जाएगा।</p>
				<p>इंडिया पोल्स</p>
				<p>कुमार,<br />इंडियापोल्स - पैनल मैनेजर</p>`, // Sending OTP
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},

	newsLetterMail: (body, emails, subject) => {
		console.log('logIn_Mail====>' + emails);
		const details = {
			from: 'panel@indiapolls.com',
			to: emails, // Receiver's email id
			subject: subject,
			html: body
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},

	manualApproveEmail: (email, coupon, pin, validity) => {
		console.log('logIn_Mail====>' + email);
		const details = {
			from: 'panel@indiapolls.com',
			to: email,
			subject: 'Your IndiaPolls Redemption request closure !',
			html: `<p>Dear User<user></p>
					<p>Your Amazon Gift Card is issued. Here are the details:</p>
					<p> Voucher Number: ${coupon} PIN: ${pin} Expires On: ${validity}</p>
					<p> Best Regards,</p>
					<p></p>
					<p>Kumar,</p>
					<p>IndiaPolls - Panel Manager</p>`
		};
		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},

	manualApproveEmailHindi: (email, coupon, pin, validity) => {
		console.log('logIn_Mail====>' + email);
		const details = {
			from: 'panel@indiapolls.com',
			to: email,
			subject: 'आपकी इंडियापोल्स रिडेम्प्शन अनुरोध समाप्ति!',
			html: `<p>प्रिय उपयोगकर्ता,</p>
					<p>आपका अमेज़न गिफ़्ट कार्ड जारी किया गया है। यहां विवरण हैं:</p>
					<p>वाउचर नंबर: ${coupon} पिन: ${pin} समय सीमा: ${validity}</p>
					<p>सर्वोत्तम शुभकामनाएँ,</p>
					<p>कुमार,</p>
					<p>इंडियापोल्स - पैनल प्रबंधक</p>`
		};

		transporter.sendMail(details, function(error, data) {
			if (error) {
				console.log('error=========>>>' + error);
				return true;
			} else {
				console.log('data=========>>>' + JSON.stringify(data));
				return true;
			}
		});
	},
}





// https://IndiaPolls.net/Accounts/VerifyEmail?email='+email+'&token='+token+'
