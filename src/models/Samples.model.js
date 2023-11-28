const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('samples', {
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
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        profileCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        lastCheckDate: {
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
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fromAge: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        toAge: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        fromRegistrationDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        toRegistrationDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        stateIds: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        cityIds: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        tierIds: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        secIds: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });
};
