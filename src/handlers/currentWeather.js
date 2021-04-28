const { getLocationInfo, getAllLocations } = require('../utils/locations');
const { findCurrentTemprature, insertNewWeatherData } = require('../weatherRepository');
const { getWeatherForLocation } = require('../weather/weatherService');
const { validategetCurrentTemp } = require('../utils/schemaValidation');
/**
 * @param {object} params - Object with the query params come from GET /current-temp request:
 *                              - countryCode {string} - The country code.
 *                              - city {string} - The city.
 * @description Fetch from the database, the current weather information of the given location, and returns the current temperature.
 *              Location defined with the format <CITY>,<COUNTRY_CODE>. For example Rotterdam,NL.
 * @returns {object}  - The current temperature measurment in the given location. The object contains 2 fields:
 *                          data {object} - The last measorment.
 *                          error {string} - If fail to get the current measurment returns error message, otherwise null.
 */
const getCurrentTempHandler = async (params) => {
    const validation = validategetCurrentTemp(params);
    if (!validation.isValid) {
        return { status: 400, data: null, error: validation.error };
    }
    const location = getLocationInfo(params.countryCode, params.city);
    const res = await findCurrentTemprature(location);
    if (!res || res.temperature === undefined)
        return {
            status: 400,
            data: null,
            error: `Currently there are no measurements for ${params.city},${params.countryCode}.`
        };
    return { status: 200, data: { temperature: res.temperature } };
};

const fetchAndStoreWetherDataForAllLocationsHandler = async () => {
    const locations = getAllLocations();
    const locMeasurPromises = locations.map((location) => getWeatherForLocation(location));

    const locationsMeasurments = (await Promise.allSettled(locMeasurPromises))
        .filter(({ status }) => status === 'fulfilled')
        .map(({ value }) => value);

    const insertPromises = locationsMeasurments.map(({ location, weatherData: { temp } }) =>
        insertNewWeatherData(location, { temperature: temp })
    );

    const insertResolved = (await Promise.allSettled(insertPromises))
        .filter(({ status }) => status === 'fulfilled')
        .map(({ value }) => value);

    return {
        status: 200,
        data: { insertedCount: insertResolved.length, totalCount: locMeasurPromises.length }
    };
};

module.exports = {
    getCurrentTempHandler,
    fetchAndStoreWetherDataForAllLocationsHandler
};
