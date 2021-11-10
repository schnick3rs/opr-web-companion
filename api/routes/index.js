const warfleetsFtl = require('./warfleetsFtl');
const warStuff = require('./warStuff');
const doubleTab = require('./doubleTab');
const armyManCombat = require('./armyManCombat');
const gfFirefight = require('./gfFirefight');
const gfArena = require('./gfArena');

module.exports = (app) => {
  // auth
  app.use('/auth', require('./auth'));
  // db access
  app.use('/game-systems', require('./gameSystems'));
  app.use('/army-books', require('./armyBooks'));
  // localhost
  app.use('/warfleets-ftl', warfleetsFtl);
  app.use('/war-stuff', warStuff);
  app.use('/double-tab', doubleTab);
  app.use('/army-man-combat', armyManCombat);
  app.use('/gf-firefight', gfFirefight);
  app.use('/gf-arena', gfArena);
  //
  app.use('/content', require('./content'));
};
