const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('survey_unique_links', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        sampleId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        surveyId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        schedulerId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        link: {
            type: DataTypes.STRING,
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
        }
    });
};
