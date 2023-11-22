const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('secquestions', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        socioeconomicclassificationid: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        questionId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        operand: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        optionIds: {
            type: DataTypes.UUID,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    });
};
