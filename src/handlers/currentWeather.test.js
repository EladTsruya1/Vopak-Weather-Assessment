describe('getCurrentTempHandler', () => {
    let weatherRepositoryMock;
    let handlers;
    beforeEach(function () {
        weatherRepositoryMock = td.replace('../weatherRepository');
        handlers = require('./currentWeather');
    });

    afterEach(function () {
        td.reset();
    });

    it('should return temp when given valid params', async () => {
        const params = {
            countryCode: 'NL',
            city: 'Rotterdam'
        };

        td.when(
            weatherRepositoryMock.findCurrentTemprature({
                ...params,
                timeZone: 'Europe/Amsterdam'
            })
        ).thenResolve({
            temperature: 10
        });

        expect(await handlers.getCurrentTempHandler(params)).to.eql({
            status: 200,
            data: { temperature: 10 }
        });
    });

    it('should return error when given wrong params', async () => {
        const params = {
            countryCode: 'code',
            city: 'city'
        };

        expect(await handlers.getCurrentTempHandler(params)).to.eql({
            status: 400,
            data: null,
            error: '"countryCode" length must be 2 characters long'
        });
    });

    it('should return error when no temp was found in db', async () => {
        const params = {
            countryCode: 'NL',
            city: 'Rotterdam'
        };

        td.when(
            weatherRepositoryMock.findCurrentTemprature({
                ...params,
                timeZone: 'Europe/Amsterdam'
            })
        ).thenResolve(null);

        expect(await handlers.getCurrentTempHandler(params)).to.eql({
            status: 400,
            data: null,
            error: 'Currently there are no measurements for Rotterdam,NL.'
        });
    });
});

describe('fetchAndStoreWetherDataForAllLocationsHandler', () => {
    let weatherRepositoryMock;
    let handlers;
    beforeEach(function () {
        weatherRepositoryMock = td.replace('../weatherRepository');
        td.replace('../weather/weatherService', {
            getWeatherForLocation: () =>
                Promise.resolve({
                    location: { city: 'city', countryCode: 'code', timeZone: 'timeZone' },
                    weatherData: { temp: 10 }
                })
        });
        handlers = require('./currentWeather');
    });

    afterEach(function () {
        td.reset();
    });

    it('should fetch temp for all locations', async () => {
        td.when(weatherRepositoryMock.insertNewWeatherData()).thenResolve(true);

        expect(await handlers.fetchAndStoreWetherDataForAllLocationsHandler()).to.eql({
            data: {
                insertedCount: 2,
                totalCount: 2
            },
            status: 200
        });
    });
});
