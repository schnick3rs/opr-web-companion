import Router from 'express-promise-router';
import cors from 'cors';

import { DataParsingService } from "opr-data-service";

const router = new Router();

router.get('/upgrade-section', cors(), async (request, response) => {

  const { input } = request.query;

  try {
    const armySection = DataParsingService.parseUpgradeText(input);
    response.status(200).json(armySection);
  } catch ({ message }) {
    response.status(404).json({ input, message });
  }

});

export default router;
