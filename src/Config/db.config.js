module.exports = {
	HOST: 'localhost',
	USER: 'postgres',
	PASSWORD: 'Password@123',

	DB: 'isnew',
	dialect: 'postgres',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
};


//Prod
// module.exports = {
// 	HOST: '20.198.255.72',
// 	USER: 'postgres',
// 	PASSWORD: 'Password@123',
//
// 	DB: 'isnew',
// 	// DB: 'survey',
// 	dialect: 'postgres',
// 	pool: {
// 		max: 5,
// 		min: 0,
// 		acquire: 30000,
// 		idle: 10000,
// 	},
// };
