const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('rewards', {
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
        rewardDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rewardType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surveyId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        referralId: {
            type: DataTypes.UUID,
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
        rewardStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        revokeDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        revokedById: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        grantedById: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        sweepstakeId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    });
};
