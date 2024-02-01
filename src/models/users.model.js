const {UserRole} = require('../enum');
const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
	return sequelize.define('user', {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		deleteRequestDate: {
			type: DataTypes.DATE
		},
		deleteConfirmDate: {
			type: DataTypes.DATE
		},
		phoneNumber: {
			type: DataTypes.STRING(150)
		},
		email: {
			type: DataTypes.STRING(256)
		},
		emailConfirmed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: false
		},
		passwordHash: {
			type: DataTypes.STRING
		},
		registerType: {
			type: DataTypes.STRING
		},
		securityStamp: {
			type: DataTypes.STRING
		},
		role: {
			type: DataTypes.STRING
		},
		facebooktoken: {
			type: DataTypes.STRING
		},
		phoneNumberConfirmed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: false
		},
		twoFactorEnabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: false
		},
		lockoutEndDateUtc: {
			type: DataTypes.DATE
		},
		lockoutEnabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			default: false
		},
		accessFailedCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			default: 0
		},
		username: {
			type: DataTypes.STRING(256)
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false
		},
		deletedAt: {
			type: DataTypes.DATE
		},
		activeStatus: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		signupIp: {
			type: DataTypes.STRING
		},
		lastUpdatedProfileId: {
			type: DataTypes.INTEGER
		},
		unsubscribeDate: {
			type: DataTypes.DATE
		},
		unsubscribeRequestDate: {
			type: DataTypes.DATE
		},
		legacyUserId: {
			type: DataTypes.INTEGER
		},
		legacyPassword: {
			type: DataTypes.STRING
		},
		legacyError: {
			type: DataTypes.STRING
		},
		registeredDate: {
			type: DataTypes.DATE
		},
		devicetoken: {
			type: DataTypes.STRING
		},
		otp: {
			type: DataTypes.STRING
		},
		language: {
			type: DataTypes.STRING
		},
	});
};
