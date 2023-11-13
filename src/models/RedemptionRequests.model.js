const { DataTypes } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('redemption_requests', {
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
        redemptionModeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        redemptionModeTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        requestDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        pointsRequested: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pointsRedeemed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        redemptionRequestStatus: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        redemptionDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancellationDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IndiaPollsNotes: {
            type: DataTypes.STRING,
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
        }
    });
};
