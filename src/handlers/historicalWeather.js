const { getLocationInfo } = require('../utils/locations');
const { calcMonthlyAvgTemp } = require('../weatherRepository');
const { validateGetAvgTempOfMonth } = require('../utils/schemaValidation');

/**
 *
 * @param { object } params - Object with the query params come from GET /current-temp request:
 *                              - countryCode { string } - Contry code.
 *                              - city: { string } - City name.
 * @returns { number } The current temperature in the given location.
 */
const getAvgTempOfMonthHandler = async (params) => {
    const validation = validateGetAvgTempOfMonth(params);
    if (!validation.isValid) {
        return { status: 400, error: validation.error };
    }

    const location = getLocationInfo(params.countryCode, params.city);
    const result = await calcMonthlyAvgTemp(location, params.date);

    return result
        ? { status: 200, data: result }
        : { status: 400, error: `There are no temprature measurments from ${params.date}` };
};

module.exports = {
    getAvgTempOfMonthHandler
};
