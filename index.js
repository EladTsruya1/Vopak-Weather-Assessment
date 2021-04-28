const { getAvgTempOfMonthHandler } = require('./src/handlers/historicalWeather');
const {
    getCurrentTempHandler,
    fetchAndStoreWetherDataForAllLocationsHandler
} = require('./src/handlers/currentWeather');

const mainHandler = async (event) => {
    const path = event?.rawPath;
    let params = event?.queryStringParameters;
    let result = null;
    switch (path) {
        case '/current-temp':
            /*TODO:: Call handler.*/
            result = await getCurrentTempHandler(params);
            break;
        case '/historical-temp':
            /*TODO:: Call handler.*/
            result = await getAvgTempOfMonthHandler(params);
            break;
        case '/current-weather':
            /*TODO:: Call handdler.*/
            /* Triggered by AWS every 1h. */
            result = await fetchAndStoreWetherDataForAllLocationsHandler();
            break;
        default:
            /*TODO:: Change for better error.*/
            result = { status: 400, error: 'Route not found' };
    }
    const response = result?.error ? result : { statusCode: 200, body: result.data };
    return response;
};

module.exports = {
    mainHandler
};
