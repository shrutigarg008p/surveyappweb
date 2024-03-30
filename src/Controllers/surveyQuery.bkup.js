// States filter
// if (sample.stateIds && sample.stateIds.length > 0) {
//     const states = sample.stateIds.map((item => item.value))
//     const statesInfo = await States.findAll({
//         where: {id: {[Op.in]: states}},
//         attributes: ['name', 'hindi'],
//         raw: true
//     })
//     const names = statesInfo.map(item => item.name);
//     const hindiNames = statesInfo.map(item => item.hindi);
//     const stringArray = names.concat(hindiNames);
//     whereClause.state = {
//         [Op.in]: stringArray
//     };
// }
//
// // Cities filter
// if (sample.cityIds && sample.cityIds.length > 0) {
//     const city = sample.cityIds.map((item => item.value))
//     const statesInfo = await Cities.findAll({
//         where: {id: {[Op.in]: city}},
//         attributes: ['name', 'hindi'],
//         raw: true
//     })
//     const names = statesInfo.map(item => item.name);
//     const hindiNames = statesInfo.map(item => item.hindi);
//     const stringArray = names.concat(hindiNames);
//     whereClause.city = {
//         [Op.in]: stringArray
//     };
// }
//
// //Segments
// if (sample.segments && sample.segments.length > 0) {
//     let obj = {}
//     const segments = sample.segments.map((item => item.label))
//     obj.segment = {
//         [Op.in]: segments
//     };
//     const segmentsCities = await Cities.findAll({
//         where: obj,
//         attributes: ['name', 'segment'],
//         raw: true
//     })
//     if (segmentsCities.length > 0) {
//         const city = segmentsCities.map((item => item.name))
//         whereClause.city = {
//             [Op.in]: city
//         };
//     }
// }
//
// //Regions
// if (sample.regions && sample.regions.length > 0) {
//     let obj = {}
//     const regions = sample.regions.map((item => item.label))
//     obj.region = {
//         [Op.in]: regions
//     };
//     const regionsCities = await Cities.findAll({
//         where: obj,
//         attributes: ['name', 'region'],
//         raw: true
//     })
//     if (regionsCities.length > 0) {
//         const city = regionsCities.map((item => item.name))
//         whereClause.city = {
//             [Op.in]: city
//         };
//     }
// }




//Scheduller
//Old version----- Start- -----
// if (emailTemplate) {
//     let sixDigitRandomNumber = Math.floor(100000 + Math.random() * 900000);
//     let assignedSurvey = []
//     let notificationsArray = []
//     let emailsArray = []
//     let smsArray = []
//     for (let i = 0; i < users.length; i++) {
//         let link = ''
//         if (survey.useUniqueLinks === true) {
//             sixDigitRandomNumber = Math.floor(100000 + Math.random() * 900000);
//             link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${users[i].userId}`
//         } else {
//             link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${users[i].userId}`
//         }
//         const data = {
//             firstName: users[i].firstName,
//             lastName: users[i].lastName,
//             surveyName: survey.name,
//             surveyDescription: survey.description,
//             surveyLink: link
//         };
//         const processedHtml = replaceVariables(emailTemplate.body, data);
//         const originalSurveyLink = appendParamsToUrl(survey.url, users[i].userId, survey.uniqueid)
//         let insertRecord = {
//             surveyId: survey.id,
//             userId: users[i].userId,
//             isStarted: false,
//             isCompleted: false,
//             isDisqualified: false,
//             isOverQuota: false,
//             isClosedSurvey: false,
//             isOutlier: false,
//             isRejected: false,
//             status: 'pending',
//             pointsRewarded: 0,
//             temporarySurveyLink: link,
//             originalSurveyLink: originalSurveyLink,
//             temporarySurveyLinkId: survey.uniqueid,
//             expiryDate: survey.expiryDate,
//             createdAt: new Date().valueOf(),
//             updatedAt: new Date().valueOf()
//         }
//         assignedSurvey.push(insertRecord)
//         surveyInvite(emailTemplate.subject, users[i].user.email, processedHtml)
//         sendSurveyMessage(`${users[i].firstName} ${users[i].lastName}`, link, users[i].mobile, survey.name)
//         if (users[i].user.devicetoken && assignedSurvey.length > 0) {
//             Notifications(users[i].user.devicetoken, emailTemplate.subject, 'New survey has been assigned to you')
//             let notificationInfo = {
//                 userId: users[i].userId,
//                 message: `You have assigned ${survey.name} survey`,
//                 type: 'survey',
//                 id: survey.id
//             }
//             notificationCreate(notificationInfo)
//         }
//     }
//     await AssignSurveys.bulkCreate(assignedSurvey)
//     console.log('calling----->', scheduleEmail.id)
//     const info = await SurveyEmailSchedules.update({
//         scheduleStatus: 'Sent',
//         emailsCreatedAt: new Date().valueOf()
//     }, {where: {id: scheduleEmail.id}})
//     console.log('info----->', info)
//
// }
//old version end-------------



//New Version scheduler-------------
//New one----
// if (emailTemplate) {
//     const totalUsers = users.length;
//     const batchSize = Math.min(totalUsers, users.length); // Define maximum batch size
//
//     const batchedUsers = [];
//     for (let i = 0; i < totalUsers; i += batchSize) {
//         batchedUsers.push(users.slice(i, i + batchSize));
//     }
//
//     const processBatch = async (batch) => {
//         const assignedSurvey = [];
//         const notificationsArray = [];
//         const emailsArray = [];
//         const smsArray = [];
//
//         // Process each user in the batch
//         for (let i = 0; i < batch.length; i++) {
//             const user = batch[i];
//             let link = '';
//
//             if (survey.useUniqueLinks === true) {
//                 link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${user.userId}`;
//             } else {
//                 link = `https://indiapolls.com:9000/surveys/${survey.uniqueid}/${user.userId}`;
//             }
//
//             const data = {
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 surveyName: survey.name,
//                 surveyDescription: survey.description,
//                 surveyLink: link
//             };
//
//             // Replace variables in email body
//             const processedHtml = replaceVariables(emailTemplate.body, data);
//
//             // Prepare record for bulk insert
//             const insertRecord = {
//                 surveyId: survey.id,
//                 userId: user.userId,
//                 isStarted: false,
//                 isCompleted: false,
//                 isDisqualified: false,
//                 isOverQuota: false,
//                 isClosedSurvey: false,
//                 isOutlier: false,
//                 isRejected: false,
//                 status: 'pending',
//                 pointsRewarded: 0,
//                 temporarySurveyLink: link,
//                 originalSurveyLink: appendParamsToUrl(survey.url, user.userId, survey.uniqueid),
//                 temporarySurveyLinkId: survey.uniqueid,
//                 expiryDate: survey.expiryDate,
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//             };
//             assignedSurvey.push(insertRecord);
//
//
//             // Send email to user
//             emailsArray.push(surveyInvite(emailTemplate.subject, 'panelist@yopmail.com', processedHtml));
//
//             // Send SMS to user
//             // smsArray.push(sendSurveyMessage(`${users[i].firstName} ${users[i].lastName}`, link, users[i].mobile, survey.name));
//
//             if (user.user.devicetoken) {
//                 // notificationsArray.push(Notifications(users[i].user.devicetoken, emailTemplate.subject, 'New survey has been assigned to you'));
//                 const notificationInfo = {
//                     userId: user.userId,
//                     message: `You have assigned ${survey.name} survey`,
//                     type: 'survey',
//                     id: survey.id
//                 };
//                 // notificationsArray.push(notificationCreate(notificationInfo));
//             }
//         }
//
//         console.log('assignedSurvey--->', assignedSurvey.length)
//         // Execute bulk operations
//         await Promise.all([
//             AssignSurveys.bulkCreate(assignedSurvey),
//             SurveyEmailSchedules.update({
//                 scheduleStatus: 'Sent',
//                 emailsCreatedAt: new Date()
//             }, {where: {id: scheduleEmail.id}}),
//             ...emailsArray,
//             ...smsArray,
//             ...notificationsArray
//         ]);
//     };
//
//     // Process each batch of users asynchronously
//     for (const batch of batchedUsers) {
//         await processBatch(batch);
//     }
// }
