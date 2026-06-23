import { defineLookupHelperTests } from './lookupHelperTests.js';

defineLookupHelperTests({
    name: 'event',
    modulePath: '../../utils/helpers/eventHelper.js',
    exportName: 'getEvent',
    table: 'events',
    key: 'events',
    buttonPrefix: 'event-',
    validId: '42',
    invalidId: '99999',
    fuzzyQuery: 'blood rain',
    alias: 'br',
});
