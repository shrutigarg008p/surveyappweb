const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('assignedSurveys', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        surveyId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isStarted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isDisqualified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isOverQuota: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isClosedSurvey: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isOutlier: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isRejected: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        pointsRewarded: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        temporarySurveyLinkId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        temporarySurveyLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        originalSurveyLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    })
};
