const db = require('../models');
const Messages = db.messages;
const Users = db.user;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
        const Survey = await Messages.create({
            userId: req.body.userId,
            queryType: req.body.queryType,
            subject: req.body.subject,
            body: req.body.body,
            queryStatus: req.body.queryStatus,
            createdAt: new Date().valueOf(),
            updatedAt: new Date().valueOf(),
        })
        return apiResponses.successResponseWithData(
            res,
            'Success!',
            Survey
        );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};


module.exports.update = async (req, res) => {
    try {
        let obj = {
            userId: req.body.userId,
            queryType: req.body.queryType,
            subject: req.body.subject,
            body: req.body.body,
            queryStatus: req.body.queryStatus,
            updatedAt: new Date().valueOf(),
        }
        const user = await Messages.update( obj, {where: {id: req.params.id}})
        return apiResponses.successResponseWithData(res, 'Success Update', user);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        Messages.belongsTo(Users, { foreignKey: 'userId' });
        const data = await Messages.findAll({
            where: { deletedAt: null },
            include: [
                {
                    model: Users,
                    required: false,
                    attributes: ['email']
                },
            ],
            limit: limit,
            order: [['createdAt', 'DESC']]
        })
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        let data = await Messages.findOne({where: {id: req.params.id, deletedAt: null}})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await Messages.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
