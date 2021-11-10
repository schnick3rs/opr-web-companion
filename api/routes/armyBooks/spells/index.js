const Router = require('express-promise-router');

const router = new Router({mergeParams: true});

router.get('/', require('./list-spells'));

router.post('/', require('./create-spell'));
router.get('/:spellUid', require('./read-spell'));
router.patch('/:spellUid', require('./update-spell'));
router.delete('/:spellUid', require('./delete-spell'));

module.exports = router;
