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
});

router.get('/upgrade-sections', async (request, response) => {

  let armyBooks = await armyBookService.getPublicArmyBooks();

  let sections = [];

  armyBooks.forEach(armyBook => {
    armyBook.upgradePackages.forEach(pack => {
      pack.sections.forEach(section => {
        sections.push({
          armyBookUid: armyBook.uid,
          armyBookName: armyBook.name,
          sectionUid: section.uid,
          sectionLabel: section.label,
          sectionType: section.type,
          sectionSelect: section.select,
          sectionAffects: section.affects,
          sectionOptionCount: section.options?.length,
        });
      });
    });
  });

  response.set('Cache-Control', 'public, max-age=600'); // 5 minutes
  response.status(200).json(sections);
});

router.get('/upgrade-options', async (request, response) => {

  let armyBooks = await armyBookService.getPublicArmyBooks();

  let upgrades = [];

  armyBooks.forEach(armyBook => {
    armyBook.upgradePackages.forEach(pack => {
      pack.sections.forEach(section => {
        section.options.forEach(option => {
          if (isNaN(option.cost) || parseInt(option.cost) === 0)
          upgrades.push({
            armyBookUid: armyBook.uid,
            armyBookName: armyBook.name,
            packHint: pack.hint,
            sectionLabel: section.label,
            optionLabel: option.label,
            optionCost: option.cost,
            optionGainsJson: JSON.stringify(option.gains),
          });
        });
      });
    });
  });

  response.set('Cache-Control', 'public, max-age=600'); // 5 minutes
  response.status(200).json(upgrades);
});

export default router;
