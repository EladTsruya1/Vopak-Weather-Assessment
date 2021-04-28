describe('getAvgTempOfMonthHandler', () => {
    let weatherRepositoryMock;
    let handlers;
    beforeEach(function () {
        weatherRepositoryMock = td.replace('../weatherRepository');
        handlers = require('./historicalWeather');
    });

    afterEach(function () {
        td.reset();
    });

    it('should fetch temp for all locations', async () => {
        const countryCode = 'SG';
        const city = 'Singapore';
        const date = '2021-03';

        td.when(
            weatherRepositoryMock.calcMonthlyAvgTemp(
                { countryCode, city, timeZone: 'Singapore' },
                date
            )
        ).thenResolve({ avgMonthlyTemp: 25 });

        const params = { countryCode, city, date };
        expect(await handlers.getAvgTempOfMonthHandler(params)).to.eql({
            data: {
                avgMonthlyTemp: 25
            },
            status: 200
        });
    });

    it("should return error if couldn't fetch avg", async () => {
        const countryCode = 'SG';
        const city = 'Singapore';
        const date = '2021-03';

        td.when(
            weatherRepositoryMock.calcMonthlyAvgTemp(
                { countryCode, city, timeZone: 'Singapore' },
                date
            )
        ).thenResolve(null);

        const params = { countryCode, city, date };
        expect(await handlers.getAvgTempOfMonthHandler(params)).to.eql({
            error: 'There are no temprature measurments from 2021-03',
            status: 400
        });
    });
});
