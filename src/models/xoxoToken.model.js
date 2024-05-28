const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('xoxo_token', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        grant_type: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        refresh_token: {
            type: Sequelize.STRING(512),
            allowNull: true,
        },
        client_id: {
            type: Sequelize.STRING(512),
            allowNull: true,
        },
        client_secret: {
            type: DataTypes.STRING
        },
        access_token: {
            type: DataTypes.STRING(1024)
        },
        counter: {
            type: DataTypes.INTEGER
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
