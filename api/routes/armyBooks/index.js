const Router = require('express-promise-router');
const cors = require('cors');
const router = new Router();

router.use('/:armyBookUid/units', require('./units'));
router.use('/:armyBookUid/upgrade-packages', require('./upgradePackages'));
router.use('/:armyBookUid/special-rules', require('./specialRules'));
router.use('/:armyBookUid/spells', require('./spells'));

router.get('/', cors(), require('./list-army-books'));
router.get('/mine', require('./list-mine-army-books'));

router.post('/', require('./create-army-book'));
router.post('/detachment', require('./create-army-book-detachment'));
router.post('/import', require('./import-army-book'));
router.get('/:armyBookUid', cors(), require('./read-army-book'));
router.get('/:armyBookUid/mine', require('./read-mine-army-book'));
router.get('/:armyBookUid/ownership', require('./is-owner-army-book'));
router.patch('/:armyBookUid', require('./update-army-book'));
router.delete('/:armyBookUid', require('./delete-army-book'));

module.exports = router;
