import Router from 'express-promise-router';
import * as armyBookService from './army-book-service';
import * as skirmificationService from './skirmification-service';
import { ArmyBook } from "opr-army-book-helper";

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
        try {
          const armySection = ArmyBook.UpgradeSection.FromString(section.label);
          sections.push({
            armyBookUid: armyBook.uid,
            armyBookName: armyBook.name,
            packHint: pack.hint,
            sectionUid: armySection.uid,
            sectionLabel: armySection.label,
            sectionType: armySection.variant,
            sectionOptionLimitAmount: armySection.optionLimitAmount,
            sectionAffectedModels: armySection.affectedModels,
            sectionAffects: armySection.affects,
            sectionOptionCount: armySection.options?.length,
          });
        } catch (e) {}
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
