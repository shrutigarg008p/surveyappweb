const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('surveypartners', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        surveyId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        partnerId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        includesid: {
            type: DataTypes.BOOLEAN
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
        }
    });
};
