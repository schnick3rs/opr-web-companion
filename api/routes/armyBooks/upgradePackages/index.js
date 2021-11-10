const Router = require('express-promise-router');

const router = new Router({mergeParams: true});

router.get('/', require('./list-upgrade-packages'));

router.post('/', require('./create-upgrade-package'));
router.get('/:upgradePackageUid', require('./read-upgrade-package'));
router.patch('/:upgradePackageUid', require('./update-upgrade-package'));
router.delete('/:upgradePackageUid', require('./delete-upgrade-package'));

module.exports = router;
