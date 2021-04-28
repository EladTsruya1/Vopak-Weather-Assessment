const got = require('got');

/* Weather API params */
const currentWeatherUri = process.env.CURRENT_WEATHER_URI;
const apiKey = process.env.API_KEY;

/**
 *
 * @returns { undefined }
 */
const getWeatherForLocation = async (location) => {
    const { city, countryCode } = location;
    const response = await got(currentWeatherUri, {
        searchParams: {
            city: `${city},${countryCode}`,
            lang: 'en',
            key: apiKey
        }
    });
    return {
        location,
        weatherData: JSON.parse(response.body).data[0]
    };
};

module.exports = {
    getWeatherForLocation
};
