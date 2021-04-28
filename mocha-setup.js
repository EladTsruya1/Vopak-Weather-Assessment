const chai = require('chai');
const td = require('testdouble');
const _ = require('lodash');

const readonly = (value) => ({
    enumerable: true,
    configurable: true,
    value
});

Object.defineProperties(
    global,
    _.mapValues(
        {
            expect: chai.expect,
            td
        },
        readonly
    )
);
