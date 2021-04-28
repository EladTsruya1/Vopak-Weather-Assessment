describe('location utils', () => {
    let locationUtils;
    beforeEach(() => {
        td.replace('../../config/locations.json', {
            NL: [['Rotterdam', 'Europe/Amsterdam']],
            SG: [['Singapore', 'Singapore']]
        });
        locationUtils = require('./locations');
    });

    it('shuold return valid if city and country code are supported', () => {
        const countryCode = 'NL';
        const city = 'Rotterdam';
        expect(locationUtils.validateLocation(countryCode, city)).to.eql({
            error: null,
            isValid: true
        });
    });

    it('shuold return error if country code is not supported', () => {
        const countryCode = 'NotExistCode';
        const city = 'city';
        expect(locationUtils.validateLocation(countryCode, city)).to.eql({
            error: 'The country code NotExistCode is not supported.',
            isValid: false
        });
    });

    it('shuold return error if city is not supported', () => {
        const countryCode = 'NL';
        const city = 'NotSupportedCity';
        expect(locationUtils.validateLocation(countryCode, city)).to.eql({
            error: 'The city NotSupportedCity is not supported.',
            isValid: false
        });
    });

    it('getLocationInfo', () => {
        const countryCode = 'NL';
        const city = 'Rotterdam';
        expect(locationUtils.getLocationInfo(countryCode, city)).to.eql({
            countryCode: 'NL',
            city: 'Rotterdam',
            timeZone: 'Europe/Amsterdam'
        });
    });

    it('getAllLocations', () => {
        expect(locationUtils.getAllLocations()).to.eql([
            {
                city: 'Rotterdam',
                countryCode: 'NL',
                timeZone: 'Europe/Amsterdam'
            },
            {
                city: 'Singapore',
                countryCode: 'SG',
                timeZone: 'Singapore'
            }
        ]);
    });
});
