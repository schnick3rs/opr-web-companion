const Router = require('express-promise-router');

const router = new Router({mergeParams: true});

router.get('/', require('./list-units'));
router.patch('/', require('./update-units'));
router.post('/sort', require('./sort-units'));
router.post('/calculate', require('./calculate-units'));

router.post('/', require('./create-unit'));
router.post('/clone', require('./clone-units'));
router.get('/:unitId', require('./read-unit'));
router.patch('/:unitId', require('./update-unit'));
router.delete('/:unitId', require('./delete-unit'));

router.get('/:unitId/calculate', require('./calculate-unit'));
router.patch('/:unitId/calculate', require('./calculate-and-update-unit'));
router.patch('/:unitId/resync', require('./resync'));

module.exports = router;
