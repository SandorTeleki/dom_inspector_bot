import { defineLookupHelperTests } from './lookupHelperTests.js';

defineLookupHelperTests({
    name: 'item',
    modulePath: '../../utils/helpers/itemHelper.js',
    exportName: 'getItem',
    table: 'items',
    key: 'items',
    buttonPrefix: 'item-',
    validId: '42',
    invalidId: '99999',
    fuzzyQuery: 'frost brand',
    alias: 'gss',
});
