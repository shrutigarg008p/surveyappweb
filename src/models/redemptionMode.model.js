const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('redemption_mode', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        minimumPoints: {
            type: DataTypes.INTEGER,
            allowNull: false
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
            defaultValue: null,
            allowNull: true,
        },
        useName: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        usePhone: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        useAddress: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    });
};
