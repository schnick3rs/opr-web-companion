// https://www.nexmo.com/blog/2018/09/11/add-2fa-to-nuxt-with-nexmo-verify-dr?sf92467419=1
// https://blog.logrocket.com/setting-up-a-restful-api-with-node-js-and-postgresql-d96d6fc892d8/
import express from 'express';
import routes from './routes';
import { verifyRequest } from './routes/authProvider';

const app = express();
app.use(express.json());
//app.set('etag', 'strong');

app.use((req, res, next) => {
  try {
    const { userId, userUuid } = verifyRequest(req);
    req.me = { userId, userUuid };
  } catch (e) {}
  next();
});

// auth
app.use('/auth', routes.auth);
app.use('/admin', routes.admin);
app.use('/account', routes.account);
app.use('/users', routes.users);

// db access
app.use('/game-systems', routes.gameSystems);
app.use('/army-books', routes.armyBooks);

// localhost
app.use('/warfleets-ftl', routes.warfleetsFtl);
app.use('/war-stuff', routes.warStuff);
app.use('/double-tab', routes.doubleTab);
app.use('/army-man-combat', routes.armyManCombat);
app.use('/gf-firefight', routes.gfFirefight);
app.use('/gf-arena', routes.gfArena);

//
app.use('/content', routes.content);
app.use('/mmf', routes.myminifactory);
app.use('/parser', routes.parser);

module.exports = {
  path: '/api',
  handler: app,
};
