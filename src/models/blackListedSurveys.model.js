const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('surveyblacklistentities', {
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
        blacklistSurveyId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        survey_id: {
            type: DataTypes.UUID,
            allowNull: false,
        }
    });
};
