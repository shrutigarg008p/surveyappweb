const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('newsletters', {
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
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        body: {
            type: Sequelize.STRING(512),
            allowNull: true,
        },
        emails: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        sendDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdById: {
            type: DataTypes.STRING,
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
        newsletterStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        emailsCreatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    })
};
