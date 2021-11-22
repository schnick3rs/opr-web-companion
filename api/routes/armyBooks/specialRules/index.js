import Router from 'express-promise-router';
import * as specialRuleService from './special-rules-service';

const router = new Router({mergeParams: true});

router.get('/', async (request, response) => {
  const { armyBookUid } = request.params;
  const specialRules = await specialRuleService.getSpecialRule(armyBookUid, request.me.userId);
  response.status(200).json(specialRules);
});

router.post('/', async (request, response) => {
  const { armyBookUid } = request.params;
  const specialRules = await specialRuleService.addSpecialRule(armyBookUid, request.body, request.me.userId);
  response.status(200).json(specialRules);
});

router.get('/:specialRuleUid', async (request, response) => {
  const { armyBookUid, specialRuleUid } = request.params;
  const specialRule = await specialRuleService.getSpecialRule(armyBookUid, request.me.userId, specialRuleUid);
  if (specialRule.length === 1) {
    response.status(200).json(specialRule);
  } else {
    response.status(404).json();
  }
});

router.patch('/:specialRuleUid', async (request, response) => {
  const { armyBookUid, specialRuleUid } = request.params;
  const specialRule = await specialRuleService.updateSpecialRule(armyBookUid, request.me.userId, specialRuleUid, request.body);
  response.status(200).json(specialRule);
});

router.delete('/:specialRuleUid', async (request, response) => {
  const { armyBookUid, specialRuleUid } = request.params;
  await specialRuleService.deleteSpecialRule(armyBookUid, request.me.userId, specialRuleUid);
  response.status(204).json();
});

export default router;
