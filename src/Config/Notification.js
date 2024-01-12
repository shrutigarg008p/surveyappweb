const admin = require('firebase-admin');
const serviceAccount = require('../../indiapolls-a9288-firebase-adminsdk-35jcy-9d36fd37f6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


module.exports = {
  // notificationCreate: (notificationData) => new Promise((resolve, reject) => {
  //   const addNotifications = new notifyDb(notificationData);
  //   addNotifications.save().then((result) => resolve(result)).catch((error) => reject(error));
  // }),




  Notifications: (token, title, message) => {
    const payload = {
      notification: {
        title: title,
        body: message,
      },
        // token: 'frKnkX-8YOaXhqYOBdeJNr:APA91bEoEr9gnvUKuUD2Rot7_3GMQrMxKMBnmef_1V7sM7tlIpDMg3_gFq-xRoKQXFr7DVF4uLuOpZrmWpEgmDMDe6LY4q5sQIPzzNg_xzi8BmAiFuv5dhoNkfpq4AmYTgF4re8-bwNd'
      token: token,
    };

    admin.messaging().send(payload)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
  },
};
