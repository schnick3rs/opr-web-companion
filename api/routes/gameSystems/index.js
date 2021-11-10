const Router = require('express-promise-router');

const router = new Router();

router.get('/', require('./list-game-systems'));
router.get('/:slug', require('./read-game-system'));

router.get('/:slug/special-rules', require('./read-game-system-special-rules'));

module.exports = router;
