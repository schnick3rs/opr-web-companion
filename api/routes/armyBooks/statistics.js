import Router from 'express-promise-router';
import * as armyBookService from './army-book-service';
import * as skirmificationService from './skirmification-service';
import {getPublicArmyBooks} from "./army-book-service";

const router = new Router();

router.get('/special-rules', async (request, response) => {

  let armyBooks = await armyBookService.getPublicArmyBooks();

  let specialRules = [];

   armyBooks.forEach(armyBook => {
     armyBook.specialRules.forEach(rule => {
       const skirmify = skirmificationService.skirmifyRulesText(rule.description);
       specialRules.push({
         armyBookUid: armyBook.uid,
         armyBookName: armyBook.name,
         name: rule.name,
         description: rule.description,
         skirmify,
         adjusted: rule.description !== skirmify,
       });
     });
  });

  response.set('Cache-Control', 'public, max-age=600'); // 5 minutes
  response.status(200).json(specialRules);
  //response.type('text/plain');
  //response.send('text');

});

export default router;
