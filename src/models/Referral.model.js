const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('referrals', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(400),
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        referralStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        referralMethod: {
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
        referredUserId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        approvalDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancellationDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        approvedById: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        cancelledById: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    });
};
