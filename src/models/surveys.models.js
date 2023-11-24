const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('surveys', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ceggPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        publishDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        userLimitCutoff: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userLimitCommitted: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        surveyType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pointAllocationType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        client: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        surveyLength: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        companyLogo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        outlierCutoffTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        costPerInterview: {
            type: DataTypes.FLOAT,
            allowNull: false,
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
        minimumInterviewDuration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        useUniqueLinks: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        closeDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ipUnique: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        legacyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        surveyUrlIdentifier: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isPaused: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    });
};
