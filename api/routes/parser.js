import Router from 'express-promise-router';
import cors from 'cors';

import * as armyBookService from './armyBooks/army-book-service';
import * as gameSystemService from './gameSystems/game-system-service';

import { DataParsingService } from "opr-data-service";

const router = new Router();


router.get('/:armyBookUid~:gameSystemId', cors(), async (request, response) => {

  const { armyBookUid, gameSystemId } = request.params;
  let userId = request?.me?.userId || 0;

  // we fetch the source for further handling
  let armyBook = await armyBookService.getArmyBookPublicOrOwner(armyBookUid, userId);

  if (armyBook && armyBook.enabledGameSystems.includes(parseInt(gameSystemId))) {

    // we overwrite with our pseudo xxx-skirmish id
    // armyBook.uid = armyBookUid;

    if ([3,5].includes(parseInt(gameSystemId))) {
      armyBook = armyBookService.skirmify(armyBook);
    }

    // add flavor
    const gameSystem = await gameSystemService.getGameSystemById(gameSystemId);
    if (gameSystem) {
      armyBook.gameSystemId = gameSystem.id;
      armyBook.gameSystemSlug = gameSystem.slug;
      armyBook.fullname = gameSystem.fullname;
      armyBook.aberration = gameSystem.aberration;
      armyBook.universe = gameSystem.universe;
      armyBook.shortname = gameSystem.shortname;
      armyBook.flavoredUid = `${armyBook.uid}~${gameSystemId}`;
    } else {
      console.warn(`No GameSystem found for gameSystem=${gameSystemId}.`);
    }

    var parsed = DataParsingService.transformApiData(armyBook);

    response.set('Cache-Control', 'public, max-age=60'); // 1 minute
    response.status(200).json(parsed);
    //response.set('Last-Modified', new Date(armyBook.modifiedAt).toUTCString());
    //return response.send({...armyBook, units});

  } else {
    response.status(404).json({});
  }

});

router.get('/upgrade-section', async (request, response) => {

  const { input } = request.query;

  try {
    const armySection = DataParsingService.parseUpgradeText(input);
    response.status(200).json(armySection);
  } catch ({ message }) {
    response.status(404).json({ input, message });
  }

});

export default router;
