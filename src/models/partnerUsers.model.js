const {UserRole} = require('../enum');
const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('partnerusers', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        partner_id: {
            type: DataTypes.STRING
        },
        survey_id: {
            type: DataTypes.STRING
        },
        rid: {
            type: DataTypes.STRING
        },
        sid: {
            type: DataTypes.STRING
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
        status: {
            type: DataTypes.STRING
        },
        ip: {
            type: DataTypes.STRING
        },
        extra_string: {
            type: DataTypes.JSON
        }
    });
};
