import Router from 'express-promise-router';
import * as spellService from './spell-service';

const router = new Router({mergeParams: true});

router.get('/', async (request, response) => {
  const { armyBookUid } = request.params;
  const spells = await spellService.getSpells(armyBookUid, request.me.userId);
  response.status(200).json(spells);
});

router.post('/', async (request, response) => {
  const { armyBookUid } = request.params;
  const spells = await spellService.addSpell(armyBookUid, request.me.userId, request.body);
  response.status(200).json(spells);
});

router.get('/:spellUid', async (request, response) => {
  const { armyBookUid, spellUid } = request.params;
  const spell = await spellService.getSpell(armyBookUid, request.me.userId, spellUid);
  if (spell.length === 1) {
    response.status(200).json(spell);
  } else {
    response.status(404).json();
  }
});

router.patch('/:spellUid', async (request, response) => {
  const { armyBookUid, spellUid } = request.params;
  const spell = await spellService.updateSpell(armyBookUid, request.me.userId, spellUid, request.body);
  response.status(200).json(spell);
});

router.delete('/:spellUid', async (request, response) => {
  const { armyBookUid, spellUid } = request.params;
  await spellService.deleteSpell(armyBookUid, spellUid, request.me.userId);
  response.status(204).json();
});

export default router;
