const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('surveyemailschedules', {
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
        surveyTemplateId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sampleId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isSendAll: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isuniqueuploaded: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        scheduleDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        scheduleType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        scheduleStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        baseEmailScheduleId: {
            type: DataTypes.INTEGER,
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
        },
        emailsCreatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    })
};
