const Router = require('express-promise-router');

const router = new Router();

// router.get('/admin-regenerate-email-hash', require('./admin-regenerate-email-hash'));

router.post('/user-account', require('./create-user-account'));

router.get('/user', require('./read-user'));

router.post('/reset-password-request', require('./reset-password-request'));
router.post('/reset-password', require('./reset-password'));

router.post('/login', require('./login-user'));
router.post('/logout', require('./logout-user'));

module.exports = router;

