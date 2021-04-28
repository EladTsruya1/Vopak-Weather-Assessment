const locationsInfoMap = require('../../config/locations.json');

const validateLocation = (countryCode, city) => {
    if (!locationsInfoMap?.[countryCode])
        return { isValid: false, error: `The country code ${countryCode} is not supported.` };
    const cities = locationsInfoMap[countryCode].map(([city]) => city);
    if (!cities.includes(city))
        return { isValid: false, error: `The city ${city} is not supported.` };
    return { isValid: true, error: null };
};

const getLocationInfo = (countryCode, city) => {
    const [, timeZone] = locationsInfoMap[countryCode].find(([cityName]) => cityName === city);
    return {
        countryCode,
        city,
        timeZone
    };
};

const getAllLocations = () =>
    Object.entries(locationsInfoMap).flatMap(([countryCode, citiesInfo]) =>
        citiesInfo.map(([city, timeZone]) => ({ city, countryCode, timeZone }))
    );

module.exports = {
    validateLocation,
    getLocationInfo,
    getAllLocations
};
