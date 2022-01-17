import Router from 'express-promise-router';
import cors from 'cors';
import { nanoid } from 'nanoid';
import pluralize from 'pluralize';

import * as armyBookService from './army-book-service';
import * as pdfService from './pdf-service';
import * as gameSystemService from '../gameSystems/game-system-service';
import * as upgradePackagesService from './upgradePackages/upgrade-packages-service';
import * as unitService from './units/unit-service';
import userAccountService from '../auth/user-account-service';

import units from './units';
import upgradePackages from './upgradePackages';
import specialRules from './specialRules';
import spells from './spells';
import {CalcHelper} from "opr-army-book-helper";
import calc from "opr-point-calculator-lib";

const router = new Router();

router.use('/:armyBookUid/units', units);
router.use('/:armyBookUid/upgrade-packages', upgradePackages);
router.use('/:armyBookUid/special-rules', specialRules);
router.use('/:armyBookUid/spells', spells);

router.get('/', cors(), async (request, response) => {

  const { gameSystemSlug } = request.query;

  // all original army books for this system
  let items = await armyBookService.getPublicArmyBooksListView(gameSystemSlug);

  if (['grimdark-future-firefight', 'age-of-fantasy-skirmish'].includes(gameSystemSlug)) {

    let parentSlug = 'grimdark-future';
    if (gameSystemSlug === 'age-of-fantasy-skirmish') {
      parentSlug = 'age-of-fantasy';
    }

    const gameSystem = await gameSystemService.getGameSystemBySlug(gameSystemSlug);

    let skirmish = await armyBookService.getPublicArmyBooksListView(parentSlug);
    skirmish = skirmish.map(armyBook => {
      armyBook.uid = `${armyBook.uid}-skirmish`;
      armyBook.autogenerated = true;

      if (gameSystem) {
        armyBook.gameSystemId = gameSystem.id;
        armyBook.gameSystemSlug = gameSystem.slug;
        armyBook.fullname = gameSystem.fullname;
        armyBook.aberration = gameSystem.aberration;
        armyBook.universe = gameSystem.universe;
        armyBook.shortname = gameSystem.shortname;
      }

      return armyBook;
    }).filter(armyBook => armyBook.enableGenerateSkirmishBook === true);
    items.push(...skirmish);
  }

  response.set('Cache-Control', 'public, max-age=600'); // 5 minutes
  response.status(200).json(items);

});

router.get('/mine', async (request, response) => {
  const armyBooks = await armyBookService.getAllByUserId(request.me.userId);

  //response.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  response.status(200).json(armyBooks);
});

router.post('/', async (request, response) => {
  const { name, hint, gameSystemId, background } = request.body;

  const armyBook = await armyBookService.createArmyBook(request.me.userId, gameSystemId, name, hint, background);

  if (armyBook) {
    response.status(200).json(armyBook);
  } else {
    response.status(400).json({message: 'Could not create army book.'});
  }

});

router.post('/detachment', async (request, response) => {
  const { name, hint, gameSystemId, parentArmyBookId, clones, syncs } = request.body;

  // create new army book
  const newArmyBook = await armyBookService.createArmyBook(request.me.userId, gameSystemId, name, hint);

  // fetch units from parent
  const parentArmyBook = await armyBookService.getArmyBookPublicOrOwner(parentArmyBookId, request.me.userId);

  // set units synced from parent
  const clonedAndSyncedUnits = parentArmyBook.units
    .filter((unit) => clones.includes(unit.id))
    .map((unit) => {
      let sync = undefined;
      if (syncs.includes(unit.id)) {
        sync = {
          parentArmyBookId,
          unitId: unit.id,
          syncAutomatic: true,
        };
      }
      return {
        ...unit,
        id: nanoid(7),
        clone: {
          parentArmyBookId,
          unitId: unit.id,
        },
        sync,
      };
    });

  await armyBookService.setUnits(newArmyBook.uid, request.me.userId, clonedAndSyncedUnits);

  // add upgrade packages
  let clonedUpgradePackages = [];
  clonedAndSyncedUnits.forEach(unit => clonedUpgradePackages.push(...unit.upgrades));
  const uniqueUpgradePackages = [ ...new Set(clonedUpgradePackages)];

  const upgradePackages = parentArmyBook.upgradePackages
    .filter((pck) => uniqueUpgradePackages.includes(pck.uid));
  await armyBookService.setUpgradePackages(newArmyBook.uid, request.me.userId, upgradePackages);

  // add special rules
  // TODO only used special rules
  await armyBookService.setSpecialRules(newArmyBook.uid, request.me.userId, parentArmyBook.specialRules)

  const updatedArmyBook = await armyBookService.getArmyBookPublicOrOwner(newArmyBook.uid, request.me.userId);

  response.status(200).json({...updatedArmyBook});
});

router.post('/import', async (request, response) => {
    const { isOpa, isAdmin }  = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to upload
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  let {
    name,
    hint,
    gameSystemId,
    background,
    versionString,
    units,
    upgradePackages,
    spells,
    specialRules,
    official,
    costModeAutomatic,
  } = request.body;

  // make all units match the requested cost mode
  units = units.map(unit => {
    unit.costMode = costModeAutomatic ? 'automatic' : 'manually';
    unit.costModeAutomatic = costModeAutomatic;

    unit.equipment.forEach((gear, index) => {
      // AF use label, but we use name
      // TODO remove once name can be used
      gear.name = gear.name || gear.label;
      //gear.name = pluralize.singular(gear.name); // we singularize any name
      gear.id = nanoid(5);
      if (gear.count && gear.count > 1 && !isNaN(gear.count)) {
        const count = gear.count;
        delete gear.count;
        for (let i = 1; i < count; i++) {
          let duplicate = {
            ...gear,
            id: nanoid(5),
          }
          unit.equipment.push(duplicate);
        }
      }
    });

    unit.equipment.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    });

    return unit;
  })

  try {
    const { uid } = await armyBookService.createArmyBook(request.me.userId, gameSystemId, name, hint, background);

    const updateSetFields = [];
    const updateSetValues = [];
    const data = request.body;
    ['version_string', 'official'].forEach((column) => {
      if(data[column] !== undefined) {
        updateSetFields.push(`${column} = $${updateSetFields.length+1}`);
        updateSetValues.push(data[column]);
      } else {
        console.info(`No entry found for ${column}`);
      }
    })
    // INFO disabled for now
    //await armyBookService.updateArmyBook(uid, request.me.userId, updateSetFields, updateSetValues);

    await armyBookService.setUnits(uid, request.me.userId, units);
    await armyBookService.setSpecialRules(uid, request.me.userId, specialRules);
    await armyBookService.setSpells(uid, request.me.userId, spells);
    await armyBookService.setUpgradePackages(uid, request.me.userId, upgradePackages);

    const armyBook = armyBookService.getArmyBookForOwner(uid, request.me.userId);

    response.status(200).json(armyBook);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
});

router.get('/:armyBookUid', cors(), async (request, response) => {

  const { armyBookUid } = request.params;
  let originArmyBookUid = armyBookUid;
  let minify = false;
  let userId = request?.me?.userId || 0;

  if (armyBookUid.endsWith('-skirmish')) {
    originArmyBookUid = armyBookUid.split('-skirmish')[0];
    minify = true;
  }

  // we fetch the source for further handling
  const armyBook = await armyBookService.getArmyBookPublicOrOwner(originArmyBookUid, userId);

  if (armyBook) {

    // we overwrite with our pseudo xxx-skirmish id
    armyBook.uid = armyBookUid;

    // enrich unit missing splitPageNumber
    armyBook.units = armyBook.units.map(unit => {
      return {
        ...unit,
        splitPageNumber: parseInt(unit.splitPageNumber) || 1,
      }
    });

    // TODO check if this book is allowed to minify
    if (minify === true && armyBook.enableGenerateSkirmishBook === true) {

      pluralize.addSingularRule(/Spear-Fuses$/, 'Spear-Fuse'); // see Custodian Brothers
      pluralize.addSingularRule(/Axes$/, 'Axe'); // see Dwaves
      pluralize.addSingularRule(/Claws$/, 'Claws'); // See Alien Hives and other bestials
      pluralize.addPluralRule(/Squads$/, 'Squad'); // See HDF and others

      armyBook.units = armyBook.units.map(unit => {

        let originalUnit = CalcHelper.normalizeUnit(unit);

        // we only recompute for units size > 1
        if (originalUnit.models > 1) {

          const cost = calc.unitCost({...originalUnit, models: 1});

          if (cost >= 100) {
            // we discard this unit later
            unit.size = 1;
          } else if (cost < 15) {
            unit.size = 3;
          } else if (cost < 5) {
            unit.size = 5;
          } else {
            unit.size = 1;
          }

          // reset the new size to compute the final cost
          const adjustedUnit = {...originalUnit, models: unit.size};
          unit.cost = CalcHelper.round(calc.unitCost(adjustedUnit));

          // We remove some common sufixes that do not make sense for unit size 1
          if (unit.size === 1) {

            // TODO better Prime Exceptions
            unit.name = unit.name.replace('Infiltration Squad', 'Infiltrator');
            unit.name = unit.name.replace('Assault Squad', 'Assault Prime Brother');
            unit.name = unit.name.replace('Blaster Squad', 'Blaster Prime Brother');
            unit.name = unit.name.replace('Guard Squad', 'Guardian');
            unit.name = unit.name.replace('Elimination Squad', 'Eliminator');
            unit.name = unit.name.replace('Eradication Squad', 'Eradicator');

            unit.name = unit.name.replace(' Squad', ''); // see HDF
            unit.name = unit.name.replace(' Squads', ''); // see HDF
            unit.name = unit.name.replace(' Mob', ''); // see Orc Marauders
            //unit.name = unit.name.replace(' Team', ''); // see Custodian Brothers
            unit.name = unit.name.replace(' Council', ''); // see High Elf Fleet
            unit.name = unit.name.replace(' Herd', ''); // see Orc Marauders

            // Pluralize according to unit size
            unit.name = pluralize(unit.name, unit.size);

            // Ensure unit equipment is named with the unit.size in mind
            unit.equipment = unit.equipment.map(weapon => {

              const name = weapon.label || weapon.name;

              weapon.name = pluralize(name, unit.size);
              weapon.label = pluralize(name, unit.size);

              return weapon;
            });

            // restructure psychic units
            const psyRuleNames = armyBook.specialRules.filter(sr => sr.description.startsWith('This unit counts as having Psychic(1)')).map(sr => sr.name); // ['Seer Council']
            if (psyRuleNames.length > 0) {
              if (unit.size === 1) {
                const psyRuleIndex = unit.specialRules.findIndex(sr => psyRuleNames.some(psyRule => sr.name === psyRule));
                if (psyRuleIndex >= 0) {
                  unit.specialRules[psyRuleIndex] = {
                    key: 'psychic',
                    name: 'Psychic',
                    rating: 1,
                  };
                }
              }
            }

          }

        }

        // Little helper
        unit.equipment = unit.equipment.map(weapon => {
          const name = weapon.label || weapon.name;
          weapon.name = name;
          weapon.label = name;
          return weapon;
        });

        // We assume, that for Skirmish, all units fit on a single page
        unit.splitPageNumber = 1;

        return unit;
      })
        .filter(unit => unit.cost < 100) // discard units with rounded cost >= 100
        .filter(unit => unit.specialRules.every(sr => sr.key !== 'artillery')) // discard units with rule 'artillery'
      ;

      // re-Sort units
      armyBook.units = unitService.sortUnitsSkirmish(armyBook.units);

      armyBook.specialRules = armyBook.specialRules.map(sr => {
        // TODO check remaining exceptions

        sr.description = sr.description.replace(
          'The hero and its unit get the Ambush special rule.',
          'The hero and up to half of its army get the Ambush special rule (must deploy within 3” of the hero).'); // see RL

        sr.description = sr.description.replace(
          'Whenever the hero’s unit fails a morale test, you must kill one of its models, and the morale test counts as passed instead.',
          'Whenever a friendly unit within 12" fails a morale test, you must kill one friendly model within 12", and then all friendly units within 12" of the killed model automatically pass morale tests until the end of the round.'); // see HDF

        sr.description = sr.description.replace(
          /pick (\w+) (friendly|enemy) (units) (within \d+..*), which (.*)/gm,
          `pick $1 $2 $3 $4. Those units, and all $2 $3 within 6" $5`);

        sr.description = sr.description.replace(
          /pick (\w+) (friendly|enemy) (unit) (within \d+..*), which (.*)/gm,
          `pick $1 $2 $3 $4. That unit, and all $2 $3 within 6" $5`);

        sr.description = sr.description.replace(
          'The hero and its unit',
          'This model and all friendly units within 12”');

        sr.description = sr.description.replace(
          'his model and its unit',
          'his model and all friendly units within 12”');

        sr.description = sr.description.replace(
          'The model and its unit',
          'This model and all friendly units within 12”');

        sr.description = sr.description.replace(
          /If the hero is part of a unit of (.*), the unit counts/,
          'All friendly units of $1 within 12" count');
        return sr;
      });

      /**
       * UPGRADE PACKAGES
       *
       * - Merge sections that use the same units, making distinction obsolete
       * - Shrink section label
       * - Merge options with same label
       * - Discard sections where prerequisite it not met
       * - Recalculate cost
       * - Discard expensive options
       * - Discard empty options
       * - Discard empty sections
       * - Discard empty packages
       */

      /* TODO merge upgrade packages for same units
       * get all units with more than one upgrade package
       *
       */
      armyBook.units.map(unit => {
        if (unit.upgrades.length > 1) {
          const otherUpgrades = armyBook.units.filter(unyt => unyt.id !== unit.id).flatMap(unyt => unyt.upgrades);
          const missing = unit.upgrades.every(upgrade => {
            return !otherUpgrades.includes(upgrade);
          });
          if (missing) {
            console.warn('merge upgrades', unit.upgrades);
          } else {
            console.warn('all fine', unit.upgrades);
          }
        }
        return unit;
      });

      // Shrink names due to units with size 1
      armyBook.upgradePackages = armyBook.upgradePackages.map(pack => {
        const usingUnits = armyBook.units.filter(unit => unit.upgrades.includes(pack.uid));
        const sizes = usingUnits.map(unit => unit.size);
        const maxSize = Math.max(...sizes);

        pack.sections = pack.sections.map(section => {

          if (maxSize === 1) {
            // TODO check how 'any' can be renamed better
            section.label = section.label.replace('Replace one', 'Replace');
            section.label = section.label.replace('Replace all', 'Replace');
            section.label = section.label.replace(/Replace up to \w+/, 'Replace');
            section.label = section.label.replace(/Replace with up to \w+/, 'Replace');
            section.label = section.label.replace('Upgrade one model', 'Upgrade');
            section.label = section.label.replace('Upgrade all models', 'Upgrade');
            section.label = section.label.replace('Upgrade any model', 'Upgrade');
            section.label = section.label.replace('One model may take', 'Take');

            section.label = pluralize(section.label, 1);

            // TODO singlularize options
            section.options = section.options.map(option => {
              option.gains = option.gains.map(gain => {
                if (gain.type === 'ArmyBookWeapon') {
                  gain.name = pluralize.singular(gain.name);
                }
                return gain;
              });
              return option;
            });

          } else {
            section.label = section.label.replace(/Replace up to \w+/, 'Replace one');
            section.label = section.label.replace(/Replace with up to \w+/, 'Replace one');
          }

          return section;
        });

        // TODO discard upgrades without prerequisite

        // group by section label
        pack.sections = pack.sections.reduce((previousValue, currentValue) => {

            let sameSectionIndex = previousValue.findIndex(
              (section) => section.label === currentValue.label
            );

            if (sameSectionIndex >= 0) {
              let options = currentValue.options;
              let existingOptions = previousValue[sameSectionIndex];
              previousValue[sameSectionIndex].options.push(...options);
            } else {
              previousValue.push(currentValue);
            }
            return previousValue;
          },
          []
        );

        return pack;
      });

      // Recalculate costs for upgrade packages
      armyBook.upgradePackages = armyBook.upgradePackages.map(pack => {
        const usingUnits = armyBook.units.filter(unit => unit.upgrades.includes(pack.uid));
        const recalcedOptions = CalcHelper.recalculateUpgradePackage(armyBookUid, pack, usingUnits, calc, {});
        for (const payload of recalcedOptions) {
          const {armyBookUid, upgradePackageUid, sectionIndex, optionIndex, option} = payload;
          pack.sections[sectionIndex].options[optionIndex] = option;
        }
        return pack;
      });

      // We remove upgrade options that cost >= 50
      armyBook.upgradePackages = armyBook.upgradePackages
        .map(pack => {
          pack.sections = pack.sections.map(section => {
            section.options = section.options.filter(option => option.cost < 50);
            return section;
          })
        // discard sections with options that are empty
        .filter(section => section.options.length > 0)
        // discard sections with add <> model -> Add one model with
        .filter(section => section.label.startsWith('Add one model with') === false);

        return pack;
      });

      armyBook.autogenerated = true;

      const parentId = armyBook.gameSystemId + 1;
      const gameSystem = await gameSystemService.getGameSystemById(parentId);
      if (gameSystem) {
        armyBook.gameSystemId = gameSystem.id;
        armyBook.gameSystemSlug = gameSystem.slug;
        armyBook.fullname = gameSystem.fullname;
        armyBook.aberration = gameSystem.aberration;
        armyBook.universe = gameSystem.universe;
        armyBook.shortname = gameSystem.shortname;
      }
    }

    response.set('Cache-Control', 'public, max-age=60'); // 1 minute
    response.status(200).json(armyBook);
    //response.set('Last-Modified', new Date(armyBook.modifiedAt).toUTCString());
    //return response.send({...armyBook, units});

  } else {
    response.status(404).json({});
  }

});

router.get('/:armyBookUid/pdf', cors(), async (request, response) => {

  const { armyBookUid } = request.params;
  let originArmyBookUid = armyBookUid;
  let minify = false;
  let userId = request?.me?.userId || 0;

  if (armyBookUid.endsWith('-skirmish')) {
    originArmyBookUid = armyBookUid.split('-skirmish')[0];
    minify = true;
  }

  const armyBook = await armyBookService.getArmyBookPublicOrOwner(originArmyBookUid, userId);

  if (!armyBook) {
    response.status(404).json({});
  } else {

    let pdfByteArray = undefined;

    let pdf = await armyBookService.readPdfA4(armyBookUid);

    if (pdf && pdf.createdAt) {
      if (new Date(pdf.createdAt).toISOString() == new Date(armyBook.modifiedAt).toISOString()) {
        pdfByteArray = pdf.byteArray;
      }
    }

    if (!pdfByteArray) {

      console.info(`[${armyBook.name}]#${armyBook.uid} :: No PDF found since ${armyBook.modifiedAt}. Fetching from service provider...`);

      //const res = await pdfService.generateViaHtml2pdf(armyBookUid);
      const res = await pdfService.generateViaHtml2pdf(armyBookUid);

      if (res) {
        pdfByteArray = res.data;
        console.info(`[${armyBook.name}] #${armyBook.uid} :: Save pdf bytes ${pdfByteArray.length}...`);
        await armyBookService.savePdfA4(armyBookUid, pdfByteArray, new Date(armyBook.modifiedAt.toISOString()), 'Html2pdf');
      } else {
        console.error(`[${armyBook.name}] #${armyBook.uid} :: PDF could not be generated!`);
      }

    } else {
      console.info(`[${armyBook.name}] #${armyBook.uid} :: PDF found.`);
    }

    response.setHeader('Content-Type', 'application/pdf');
    const pdfFileName = `${armyBook.aberration} - ${armyBook.name} ${armyBook.versionString}`;
    response.setHeader('Content-Disposition', `inline; filename="${pdfFileName}.pdf"`);
    response.setHeader('Content-Transfer-Encoding', 'binary');
    response.setHeader('Accept-Ranges', 'bytes');
    response.set('Cache-Control', 'public, max-age=60'); // 1 minute
    response.send(pdfByteArray);
  }
});

router.get('/:armyBookUid/mine', async (request, response) => {
  const { armyBookUid } = request.params;

  const armyBook = await armyBookService.getArmyBookForOwner(armyBookUid, request.me.userId);

  if (!armyBook) {
    response.status(404).json({message: 'Not found or no ownership'});
  } else {
    const units = armyBook.units.map(unit => {
      return {
        ...unit,
        splitPageNumber: parseInt(unit.splitPageNumber) || 1,
      };
    });
    response.status(200).json({...armyBook, units});
  }

});

router.get('/:armyBookUid/ownership', async (request, response) => {
  const { armyBookUid } = request.params;

  const armyBook = await armyBookService.getSimpleArmyBook(armyBookUid);

  if (!armyBook) {
    response.status(404).json({message: 'Not found.'});
  }

  if (armyBook.userId !== request.me.userId) {
    response.status(403).json({message: 'Permission required.'});
  } else {
    response.status(200).json({...armyBook});
  }

});

router.post('/:armyBookUid/calculate', async (request, response) => {
  const { isOpa, isAdmin }  = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid } = request.params;

  try {
    const armyBook = await armyBookService.getArmyBookForOwner(armyBookUid, request.me.userId);

    let { units, upgradePackages, specialRules } = armyBook;
    const customRules = CalcHelper.toCustomRules(specialRules);

    const unitz = units.map(unit => {
      if (unit.costModeAutomatic) {
        const originalUnit = CalcHelper.normalizeUnit(unit);
        const unitCost = calc.unitCost(originalUnit, customRules);
        const cost = CalcHelper.round(unitCost);
        return {
          ...unit,
          cost,
        };
      } else {
        return unit;
      }
    });
    await unitService.updateUnits(armyBookUid, request.me.userId, unitz);

    const upgradePackagez = [];
    for (const pack of upgradePackages) {
      const usingUnits = unitz.filter(unit => unit.upgrades.includes(pack.uid));
      const recalcedOptions = CalcHelper.recalculateUpgradePackage(armyBookUid, pack, usingUnits, calc, customRules);
      for (const payload of recalcedOptions) {
        const { armyBookUid, upgradePackageUid, sectionIndex, optionIndex, option } = payload;
        pack.sections[sectionIndex].options[optionIndex] = option;
      }
      upgradePackagez.push(pack);
    }
    await upgradePackagesService.updateUpgradePackages(armyBookUid, request.me.userId, upgradePackagez);

    response.status(200).json({ units: unitz, upgradePackages: upgradePackagez});
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'could not calculate unit costs'});
  }
});

router.patch('/:armyBookUid', async (request, response) => {
  const { armyBookUid } = request.params;
  const data = request.body

  const patchableColumns = [
    'version_string',
    'name',
    'background',
    'hint',
    'cover_image_path',
    'cover_image_credit',
    'is_live',
    'official',
    'enable_generate_skirmish_book',
  ];
  const updateSetFields = [];
  const updateSetValues = [];
  patchableColumns.forEach((column) => {
    if(data[column] !== undefined) {
      updateSetFields.push(`${column} = $${updateSetFields.length+1}`);
      updateSetValues.push(data[column]);
    } else {
      console.info(`No entry found for ${column}`);
    }
  })

  try {
    await armyBookService.updateArmyBook(armyBookUid, request.me.userId, updateSetFields, updateSetValues)
    response.status(204).json();
  } catch (e) {
    console.warn(e)
    response.status(500).json({message: 'Could not update armybook'});
  }

});

router.delete('/:armyBookUid', async (request, response) => {
  const { armyBookUid } = request.params;

  await armyBookService.deleteArmyBook(armyBookUid, request.me.userId);

  response.status(204).json();
});

export default router;
