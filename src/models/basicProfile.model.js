const {UserRole} = require('../enum');
const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('basic_profile',
        {
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            gender: {
                type: DataTypes.STRING,
                allowNull: false
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false
            },
            dateOfBirth: {
                type: DataTypes.STRING,
                allowNull: false
            },
            referralSource: {
                type: DataTypes.STRING,
                allowNull: false
            },
            addressLine1: {
                type: DataTypes.STRING,
                allowNull: false
            },
            addressLine2: {
                type: DataTypes.STRING,
                allowNull: true
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pinCode: {
                type: DataTypes.STRING,
                allowNull: false
            },
            acceptTerms: {
                type: DataTypes.BOOLEAN,
                allowNull: false
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
                type: DataTypes.DATE,
                allowNull: true
            },
            registrationIp: {
                type: DataTypes.STRING,
                allowNull: true
            },
            imagePath: {
                type: DataTypes.STRING,
                allowNull: true
            }
        });
};
