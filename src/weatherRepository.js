const { MongoClient } = require('mongodb');
const moment = require('moment-timezone');

/* Database params */
const connectionString =
    process.env.CONNECTION_STR ||
    'mongodb+srv://admin:PGLTctZksCXESISy@vopaktemperaturdev.guxl4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const dbName = process.env.DB_NAME || 'W-Corp-Weather';

let connection = null;

/**
 *
 * @returns
 */
const getDbCollection = async (collectionName) => {
    if (!connection) {
        connection = MongoClient.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    connection = await connection;
    return connection.db(dbName).collection(collectionName);
};

/**
 *
 * @param {object} connection - MongoDb database connection.
 * @param {string} city - The city.
 * @param {string} countryCode - The country code.
 * @returns {object} - Object with the last measurment of the city, from today.
 */
const findCurrentTemprature = async (location) => {
    const collection = await getDbCollection('Weather-Data');

    const res = await collection
        .find(
            { city: location.city, countryCode: location.countryCode },
            { projection: { temperature: { $arrayElemAt: ['$measurements', -1] }, _id: 0 } }
        )
        .sort({ _id: -1 })
        .limit(1)
        .toArray();
    return res?.[0] || null;
};

/**
 *
 * @param { object } location - Loaction object:
 *                                city { string } -
 *                                countryCode { string } -
 *                                timezone { string } -
 * @param { string } date - Date in format YYYY-MM.
 * @returns
 */
const calcMonthlyAvgTemp = async (location, date) => {
    const collection = await getDbCollection('Weather-Data');

    const startDateOfMonth = moment(date).tz(location.timeZone).startOf('month').utc().toDate();
    const endDateOfMonth = moment(date).tz(location.timeZone).endOf('month').utc().toDate();

    const result = (
        await collection
            .aggregate([
                {
                    $match: {
                        city: location.city,
                        countryCode: location.countryCode,
                        startDate: { $gte: startDateOfMonth },
                        endDate: { $lte: endDateOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        dailyAvgTemp: { $avg: { $divide: ['$mSum', '$mCount'] } }
                    }
                }
            ])
            .toArray()
    )[0];

    return result ? { avgMonthlyTemp: result.dailyAvgTemp } : null;
};

const insertNewWeatherData = async (location, weatherData) => {
    const collection = await getDbCollection('Weather-Data');
    const { city, countryCode, timeZone } = location;

    const currLocalizeDate = moment().tz(timeZone);
    const currentDateUtc = currLocalizeDate.utc().toDate();
    const { temperature: newTemp } = weatherData;
    const newMeasurement = { temperature: newTemp, timestamp: currentDateUtc };

    //update existing measurements array
    const {
        result: { nModified }
    } = await collection.updateOne(
        {
            city,
            countryCode,
            startDate: { $lte: currentDateUtc },
            endDate: { $gte: currentDateUtc }
        },
        { $push: { measurements: newMeasurement }, $inc: { mCount: 1, mSum: newTemp } }
    );

    if (nModified === 1) return true;

    // If there is no doc updated - insert new document

    var begOfDay = currLocalizeDate.startOf('day').utc().toDate();
    var endOfDay = currLocalizeDate.endOf('day').utc().toDate();

    var newDoc = {
        startDate: begOfDay,
        endDate: endOfDay,
        timeZone,
        countryCode,
        city,
        measurements: [newMeasurement],
        mCount: 1,
        mSum: newTemp
    };

    await collection.insertOne(newDoc);
    return true;
};

module.exports = {
    findCurrentTemprature,
    calcMonthlyAvgTemp,
    insertNewWeatherData
};
