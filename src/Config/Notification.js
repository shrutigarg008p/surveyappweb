const admin = require('firebase-admin');
const serviceAccount = require('../../indiapolls-a9288-firebase-adminsdk-35jcy-9d36fd37f6.json');
const db = require('../models');
const {DataTypes} = require("sequelize");
const NotificationsDb = db.notifications

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


module.exports = {
  notificationCreate: (notificationData) => new Promise(async (resolve, reject) => {
      try {
          let body = {
              userId: notificationData.userId,
              message: notificationData.message,
              messageType: notificationData.type,
              itemId: notificationData.id,
              isRead: false,
              createdAt: new Date().valueOf(),
              updatedAt: new Date().valueOf(),
          }
          console.log('body--->', body)
          return await NotificationsDb.create(body);
      } catch (err) {
          console.log('error------>', err)
      }
  }),




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
          return true
        })
        .catch((error) => {
          console.error('Error sending message:', error);
          return true
        });
  },
};
