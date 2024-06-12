const axios = require('axios');
const qs = require('qs');



const sendSurveyWhatsappMessage = async (fullName, surveyUrl, mobile, surveyName) => {
    try {
        console.log('fullName, surveyUrl, mobile, surveyName--->', fullName, surveyUrl, mobile, surveyName)
        let data = qs.stringify({
            'source': '919971007221',
            'destination': `91${mobile}`,
            'template': JSON.stringify({
                id: "7c7fef2c-e251-49c5-88e2-4fd600db18d6",
                params: [fullName, surveyName, surveyUrl]
            })
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://api.gupshup.io/sm/api/v1/template/msg',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Apikey': 'tw7mhxi8tr0knog8urczipcpgytucofz'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                return true
            })
            .catch((error) => {
                console.log(error);
                return true
            });
    } catch (error) {
        console.error('Error sending message:', error);
        return true
    }
};

const sendSurveyWhatsappMessageHindi = async (fullName, surveyUrl, mobile, surveyName) => {
    try {
        let data = qs.stringify({
            'source': '919971007221',
            'destination': `91${mobile}`,
            'template': JSON.stringify({
                id: "06ca9091-a577-4002-8cc6-1b5a26c012be",
                params: [fullName, surveyName, surveyUrl]
            })
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://api.gupshup.io/sm/api/v1/template/msg',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Apikey': 'tw7mhxi8tr0knog8urczipcpgytucofz'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                return true
            })
            .catch((error) => {
                console.log(error);
                return true
            });
    } catch (error) {
        console.error('Error sending message:', error);
        return true
    }
};


const sendMobileVerificationWhatsappMessage = async (otp, mobile, name) => {
    try {
        let data = qs.stringify({
            'source': '919971007221',
            'destination': `91${mobile}`,
            'template': JSON.stringify({
                id: "4c16b3e7-1e7a-4572-92aa-2f42dbf262cc",
                params: [name, otp]
            })
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://api.gupshup.io/sm/api/v1/template/msg',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Apikey': 'tw7mhxi8tr0knog8urczipcpgytucofz'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                return true
            })
            .catch((error) => {
                console.log(error);
                return true
            });
    } catch (error) {
        console.error('Error sending message:', error);
        return true
    }
};


const sendMobileVerificationWhatsappMessageHindi = async (otp, mobile, name) => {
    try {
        let data = qs.stringify({
            'source': '919971007221',
            'destination': `91${mobile}`,
            'template': JSON.stringify({
                id: "703d55a6-ceed-4808-b47b-a4098192c915",
                params: [name, otp]
            })
        });

        console.log('data---->', data)
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://api.gupshup.io/sm/api/v1/template/msg',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Apikey': 'tw7mhxi8tr0knog8urczipcpgytucofz'
            },
            data : data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                return true
            })
            .catch((error) => {
                console.log(error);
                return true
            });
    } catch (error) {
        console.error('Error sending message:', error);
        return true
    }
};


module.exports = {
    sendSurveyWhatsappMessage,
    sendSurveyWhatsappMessageHindi,
    sendMobileVerificationWhatsappMessage,
    sendMobileVerificationWhatsappMessageHindi
}
