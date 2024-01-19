const axios = require('axios');

const sendSurveyMessage = async (fullName, surveyUrl, mobile, surveyName) => {
    try {
        const response = await axios.get('https://enterprise.smsgupshup.com/GatewayAPI/rest', {
            params: {
                method: 'SendMessage',
                send_to: `91${mobile}`,
                msg: `Dear ${fullName}, Here is our latest Indiapolls survey on Survey ${surveyName}, especially for you. Please click here ${surveyUrl} to start your survey. Thank you!`,
                msg_type: 'TEXT',
                userid: '2000237056',
                auth_scheme: 'plain',
                password: 'AK9m4gQH',
                v: '1.1',
                format: 'text',
            },
        });

        console.log('Response:', response.data);
        return true
    } catch (error) {
        console.error('Error sending message:', error.message);
        return true
    }
};


const sendVerificationMessage = async (otp, mobile, name) => {
    try {
        const response = await axios.get('https://enterprise.smsgupshup.com/GatewayAPI/rest', {
            params: {
                method: 'SendMessage',
                send_to: `91${mobile}`,
                msg: `Dear ${name}, Please use ${otp} for your account verification on Indiapolls. Thank you !`,
                msg_type: 'TEXT',
                userid: '2000237056',
                auth_scheme: 'plain',
                password: 'AK9m4gQH',
                v: '1.1',
                format: 'text',
            },
        });
        console.log('Response:', response.data);
        return true
    } catch (error) {
        console.error('Error sending message:', error.message);
        return true
    }
};


function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString(); // Convert to string if needed
}

module.exports = {
    sendSurveyMessage,
    sendVerificationMessage,
    generateOTP
}
