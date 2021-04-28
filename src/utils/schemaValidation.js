const Joi = require('joi');
const moment = require('moment');
const { validateLocation } = require('./locations');

const getCurrTempSchema = Joi.object({
    countryCode: Joi.string().length(2).case('upper'),
    city: Joi.string()
});

const getAvgTempOfMonthSchema = Joi.object({
    countryCode: Joi.string().length(2).case('upper').required(),
    city: Joi.string().required(),
    date: Joi.string()
        .pattern(new RegExp(/^\d{4}-\d{2}$/))
        .required()
});

/**
 *
 * @param {object} - Query params object comes from the request.
 * @returns {object} : Validation result object:
 *                      isValid {boolean} - True is the query params are valid, otherwise returns false.
 *                      error {string} - If the params object is not valid returns error message, otherwise null.
 */
const validategetCurrentTemp = (params) => {
    const schemaValidation = getCurrTempSchema.validate(params);
    let error =
        schemaValidation?.error?.message || validateLocation(params.countryCode, params.city).error;
    return { isValid: !error, error };
};

const validateGetAvgTempOfMonth = (params) => {
    const validationResult = getAvgTempOfMonthSchema.validate(params);
    let error = validationResult?.error || validateLocation(params.countryCode, params.city).error;
    if (!moment(params.date, 'YYYY-MM').isValid()) error = `${params.date} is not a valid date.`;
    return { isValid: !error, error };
};

module.exports = {
    validategetCurrentTemp,
    validateGetAvgTempOfMonth
};
