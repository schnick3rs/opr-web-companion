import Router from 'express-promise-router';
import { ArmyBook } from "opr-army-book-helper";

const router = new Router();

router.get('/upgrade-section', async (request, response) => {

  const { input } = request.query;

  const armySection = ArmyBook.UpgradeSection.FromString(input);

  response.status(200).json(armySection);
});

export default router;
