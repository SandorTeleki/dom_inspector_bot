import { defineLookupHelperTests } from './lookupHelperTests.js';

defineLookupHelperTests({
    name: 'site',
    modulePath: '../../utils/helpers/siteHelper.js',
    exportName: 'getSite',
    table: 'sites',
    key: 'sites',
    buttonPrefix: 'site-',
    validId: '3',
    invalidId: '99999',
    fuzzyQuery: 'lava lake',
    alias: 'best',
    expectedFuzzyButtons: 0,
});
