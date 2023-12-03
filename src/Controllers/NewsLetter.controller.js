const db = require('../models');
const NewsLetters = db.newsletters;
const NewsLettersSamples = db.newslettersSamples;
const apiResponses = require('../Components/apiresponse');

module.exports.create = async (req, res) => {
    try {
            const Survey = await NewsLetters.create({
                name: req.body.name,
                subject: req.body.subject,
                body: req.body.body,
                emails: req.body.emails,
                sendDate: req.body.sendDate,
                createdById: req.body.createdById,
                newsletterStatus: req.body.newsletterStatus,
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
            name: req.body.name,
            subject: req.body.subject,
            body: req.body.body,
            emails: req.body.emails,
            sendDate: req.body.sendDate,
            createdById: req.body.createdById,
            newsletterStatus: req.body.newsletterStatus,
            updatedAt: new Date().valueOf(),
        }
        const user = await NewsLetters.update( obj, {where: {id: req.params.id}})
        return apiResponses.successResponseWithData(res, 'Success Update', user);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const limit = req.params.limit;
        const data = await NewsLetters.findAll({ where: { deletedAt: null }, limit: limit, order: [['createdAt', 'DESC']]})
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.getOne = async (req, res) => {
    try {
        let data = await NewsLetters.findOne({where: {id: req.params.id, deletedAt: null}})
        if(data) {
            const newsletterSample = await NewsLettersSamples.findOne({where: {newsletter_id: req.params.id, deletedAt: null}})
            data = { ...data.toJSON(), newsletterSample };
        }
        return apiResponses.successResponseWithData(res, 'success!', data);
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};

module.exports.delete = async (req, res) => {
    try {
        await NewsLetters.update({
                deletedAt: new Date().valueOf(),
            },
            { where: { id : req.params.id },
            })
        return apiResponses.successResponseWithData(res, 'Success');
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};



module.exports.createNewsletterSamples = async (req, res) => {
    try {
        let data = await NewsLettersSamples.findOne({where: {
            newsletter_id: req.body.newsletter_id,
            deletedAt: null
        }
        }
        )

        console.log('data--->', data)
        if(!data) {
            const question = await NewsLettersSamples.create({
                newsletter_id: req.body.newsletter_id,
                sample_id: req.body.sample_id,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            })
        } else {
            const info = {
                sample_id: req.body.sample_id,
                updatedAt: new Date().valueOf(),
            }
            console.log('calling---->', info)
            await NewsLettersSamples.update( info, {where: {id: data.id}})
        }
            return apiResponses.successResponseWithData(
                res,
                'Success!',
            );
    } catch (err) {
        return apiResponses.errorResponse(res, err);
    }
};
