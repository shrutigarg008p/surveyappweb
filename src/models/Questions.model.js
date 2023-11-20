const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('questions', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        profileId: {
            type: Sequelize.UUID,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hint: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        displayType: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dataType: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });
};
