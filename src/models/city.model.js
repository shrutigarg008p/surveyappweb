const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('city', {
        id: {
            type: Sequelize.STRING,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        stateId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        zipCode: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        region: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        segment: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
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
        tier: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    });
};
