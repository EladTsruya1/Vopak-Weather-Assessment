/*
API Keys: 
 elad06965: 977bb928a3b2438888c13a849f14b6fe
 tsruyaelad: a8e3e72f175f4c29a790ef48ee9a18f9
 eladts01: 9b27607a433344cea7503b2e8e1858c2 - Used
 almaelad: fd33089d7b074207913ddbc12cb8da93 - Used


dataModel: 
    {
        countryCode: "NL" | "SG",
        city: "Rotterdam" | "Singapore",
        timestamp: "1619177019", 
        unit: 'c',
        avgTemp: 24,

    }
TODO:
    1) Create database connection.
*/

import got from 'got';
import _ from 'lodash';
import mongodb from 'mongodb';
import moment from 'moment-timezone';

/* Database params */
const mongoUser = 'admin';
const mongoPass = 'PGLTctZksCXESISy';
const connectionString = `mongodb+srv://${mongoUser}:${mongoPass}@vopaktemperaturdev.guxl4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
let dbConnection = null;
let db = null;
const dailyWeatherCollection = 'Weather-Data';
/* Weather API params */
const dailyTempBaseUrl = 'https://api.weatherbit.io/v2.0/history/daily';
const apiKey = '977bb928a3b2438888c13a849f14b6fe';

/*Supported Locations*/
const Locations = {
    rotterdam: {
        city: 'Rotterdam',
        countryCode: 'NL',
        timeZone: 'Europe/Amsterdam'
    },
    singapore: {
        city: 'Singapore',
        countryCode: 'SG',
        timeZone: 'Singapore'
    }
};

const setupDbConnection = async () => {
    const client = new mongodb.MongoClient(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    dbConnection = await client.connect();
    db = client.db('W-Corp-Weather');
};

const tearDownConnection = async () => {
    dbConnection.close();
};

/**
 *
 * @param {string} location
 * @param {Date} date - date format YYYY-MM-DD
 * @returns data model object
 */
const getDailyWether = async (location, date) => {
    console.log(
        `getDailyWether called with params: location = ${JSON.stringify(location)}, date = ${date}`
    );
    const startDate = new Date(date).toISOString().slice(0, 10);
    const endDate = new Date(date.setDate(date.getDate() + 1)).toISOString().slice(0, 10);
    const response = await got(dailyTempBaseUrl, {
        searchParams: {
            city: `${location.city},${location.countryCode}`,
            lang: 'en',
            key: apiKey,
            start_date: startDate,
            end_date: endDate
        }
    });

    // Validate response status + add error handler.
    const payload = JSON.parse(response.body);
    // simulate 24 entries
    const temp = payload.data[0].temp;
    const measurements = Array(24).fill({ temperature: temp, timestame: date });

    const res = {
        //measuredAt: new Date(payload.data[0].ts * 1000),
        startDate: moment(date).tz(location.timeZone).startOf('day').utc().toDate(),
        endDate: moment(date).tz(location.timeZone).endOf('day').utc().toDate(),
        timeZone: location.timeZone,
        countryCode: location.countryCode,
        city: location.city,
        measurements,
        mCount: 24,
        mSum: temp * 24
    };

    console.log(JSON.stringify(res));
    return res;
};

/**
 *
 */
const fetchHistoricalData = async (location) => {
    console.log(`fetchHistoricalData called with loaction = ${location}`);
    const locationObject = Locations?.[location];
    const now = new Date();
    if (!locationObject) throw 'Location does not exist';

    const dates = Array.from(
        { length: 200 },
        (val, indx) => new Date(new Date().setDate(now.getDate() - indx))
    );
    const promisesArray = _.transform(
        dates,
        (result, date) => {
            result.push(getDailyWether(locationObject, date));
        },
        []
    );
    return (await Promise.allSettled(promisesArray))
        .filter(({ status }) => status === 'fulfilled')
        .map(({ value }) => value);
};

/**
 * main function.
 */
(async () => {
    try {
        //Setup databse connection.
        await setupDbConnection();
        const dailyCollection = db.collection(dailyWeatherCollection);
        //Fetch and store historical data.
        const documentsToInsert = await fetchHistoricalData('rotterdam');
        console.log(`documentsToInsert === ${JSON.stringify(documentsToInsert)}`);
        await dailyCollection.insertMany(documentsToInsert);
        //Close connection.
        tearDownConnection();
        console.log('Execution ends successfully.');
    } catch (error) {
        console.error(`Execution ends with error: ${error}.`);
    }
})();
