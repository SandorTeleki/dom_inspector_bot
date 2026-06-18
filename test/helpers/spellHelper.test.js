import { defineLookupHelperTests } from './lookupHelperTests.js';

defineLookupHelperTests({
    name: 'spell',
    modulePath: '../../utils/helpers/spellHelper.js',
    exportName: 'getSpell',
    table: 'spells',
    key: 'spells',
    buttonPrefix: 'spell-',
    validId: '7',
    invalidId: '99999',
    fuzzyQuery: 'foul vapors',
    alias: 'fv',
});
