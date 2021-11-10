const Router = require('express-promise-router');

const router = new Router({mergeParams: true});

router.get('/', require('./list-special-rules'));

router.post('/', require('./create-special-rule'));
router.get('/:specialRuleUid', require('./read-special-rule'));
router.patch('/:specialRuleUid', require('./update-special-rule'));
router.delete('/:specialRuleUid', require('./delete-special-rule'));

module.exports = router;
