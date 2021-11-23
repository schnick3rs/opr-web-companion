import Router from 'express-promise-router';
import {applyPatch} from 'rfc6902';
import calc from 'opr-point-calculator-lib';
import {ArmyBookHelper, CalcHelper} from 'opr-army-book-helper';
import * as unitService from './unit-service';
import * as armyBookService from '../army-book-service';
import userAccountService from '../../auth/user-account-service';

const router = new Router({mergeParams: true});

router.get('/', async (request, response) => {
  const { armyBookUid } = request.params;

  try {
    const units = await unitService.getUnits(armyBookUid, request.me.userId);
    if (units) {
      response.status(200).json(units);
    } else {
      response.status(404).json();
    }
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'Could not fetch units'});
  }
});

router.patch('/', async (request, response) => {
    const { armyBookUid } = request.params;
    const units = request.body;

    try {
      await unitService.updateUnits(armyBookUid, request.me.userId, units);
      response.status(200).json(units);
    } catch (e) {
      console.error(e);
      response.status(400).json({e});
    }
  });

router.post('/sort', async (request, response) => {
  const { armyBookUid } = request.params;

  try {
    const unsorted = await unitService.getUnits(armyBookUid, request.me.userId);
    const sorted = unitService.sortUnits(unsorted);
    await unitService.updateUnits(armyBookUid, request.me.userId, sorted);
    response.status(200).json(sorted);
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'Could not sort units.'});
  }
});

router.post('/calculate', async (request, response) => {
  const { isOpa, isAdmin }  = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid } = request.params;

  try {
    const armyBook = await armyBookService.getArmyBookForOwner(armyBookUid, request.me.userId);
    let { units, specialRules } = armyBook;

    const unitz = units.map(unit => {
      if (unit.costModeAutomatic) {
        const originalUnit = CalcHelper.normalizeUnit(unit);
        const customRules = CalcHelper.toCustomRules(specialRules);
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
    response.status(200).json(unitz);
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'could not calculate unit costs'});
  }
});

router.post('/', async (request, response) => {
  try {
    const unit = await unitService.addUnit(request.params.armyBookUid, request.me.userId, request.body);
    response.status(200).json(unit);
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'Could not create unit.'});
  }
});

router.post('/clone', async (request, response) => {
  const { armyBookUid } = request.params;
  const toClone = request.body;

  // fetch units from army books
  let units = [];
  for (let i = 0; i < toClone.length; i++) {
    const clone = toClone[i];
    const { parentArmyBookId, unitId } = clone;
    let parentUnit = await unitService.getUnit(parentArmyBookId, request.me.userId, unitId);
    let newUnit = {
      ...parentUnit,
      id: unitService.generateUnitId(),
      clone: {
        parentArmyBookId,
        unitId: parentUnit.id,
      },
    };
    if (clone.sync) {
      newUnit.sync = {
        parentArmyBookId,
        unitId: parentUnit.id,
        syncAutomatic: true,
      };
    }
    await armyBookService.addUnit(armyBookUid, request.me.userId, newUnit);
    units.push(newUnit);
  }

  // add upgrade packages
  let newUpgradePackages = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const parentUpgradePackages = await armyBookService.getUpgradePackages(unit.clone.parentArmyBookId, request.me.userId);
    const targetUpgradePackages = await armyBookService.getUpgradePackages(armyBookUid, request.me.userId);
    const unitUpgradePackages = unit.upgrades.map(uid => {
      return parentUpgradePackages.find(u => u.uid === uid);
    });
    const newPackages = unitUpgradePackages.filter(parentUnitPck => {
      return !targetUpgradePackages.some(targetPck => targetPck.uid === parentUnitPck.uid);
    });
    for (let j = 0; j < newPackages.length; j++) {
      const newPackage = newPackages[j];
      await armyBookService.addUpgradePackage(armyBookUid, request.me.userId, newPackage);
      newUpgradePackages.push(newPackage);
    }
  }

  // add special rules
  /**
   * 1. fetch parent special rules
   * 2. fetch target special rules
   * 3. check which rules this unit uses and
   */
  let newSpecialRules = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const unitSpecialRules = unit.specialRules;
    const parentSpecialRules = await armyBookService.getSpecialRules(unit.clone.parentArmyBookId, request.me.userId);
    const targetSpecialRules = await armyBookService.getSpecialRules(armyBookUid, request.me.userId);
    const newRules = parentSpecialRules.filter((parentRule) => {
      // only rules that the unit uses
      return unitSpecialRules.some((unitRule) => unitRule.key === parentRule.key);
    }).filter((unitRule) => {
      return !targetSpecialRules.some((targetRule) => targetRule.key === unitRule.key);
    });

    for (let j = 0; j < newRules.length; j++) {
      let newRule = newRules[j];
      await armyBookService.addSpecialRule(armyBookUid, request.me.userId, newRule);
      newSpecialRules.push(newRule);
    }

    /**
     * we iterate over each upgrade package and extract all special rules
     * 2. remove duplicates
     * 3. check missing
     * 4. add to army book
     */
    const newPackageRules = [];
    let upgradesSpecialRules = [];

    upgradesSpecialRules = ArmyBookHelper.getAllSpecialRulesFromUpgradePackages(newUpgradePackages);

    // remove duplicates
    upgradesSpecialRules = upgradesSpecialRules.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);

    const freshTargetSpecialRules = await armyBookService.getSpecialRules(armyBookUid, request.me.userId);
    parentSpecialRules.filter((parentRule) => {
      // only rules that the unit uses
      return unitSpecialRules.some((unitRule) => unitRule.key === parentRule.key);
    }).filter((unitRule) => {
      return !freshTargetSpecialRules.some((targetRule) => targetRule.key === unitRule.key);
    });

    for (let j = 0; j < newPackageRules.length; j++) {
      let newRule = newPackageRules[j];
      await armyBookService.addSpecialRule(armyBookUid, request.me.userId, newRule);
      newSpecialRules.push(newRule);
    }

  }


  response.status(200).json({units, upgradePackages: newUpgradePackages, specialRules: newSpecialRules});

  // response.status(400).json({message: 'Could not clone units.'});
});

router.get('/:unitId', async (request, response) => {
  const { armyBookUid, unitId } = request.params;

  try {
    const unit = await unitService.getUnit(armyBookUid, request.me.userId, unitId);
    response.status(200).json(unit);
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'Could not read unit.'});
  }
});

router.patch('/:unitId', async (request, response) => {
  const { armyBookUid, unitId } = request.params;
  const unit = request.body;

  try {
    await unitService.updateUnit(armyBookUid, request.me.userId, unitId, unit);
    response.status(200).json(unit);
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'Could not update unit.'});
  }

});

router.delete('/:unitId', async (request, response) => {
  const { armyBookUid, unitId } = request.params;

  try {
    await unitService.deleteUnit(armyBookUid, request.me.userId, unitId);
    response.status(204).json();
  } catch (e) {
    console.error(e);
    response.status(400).json({message: 'Could not delete unit.'});
  }
});

router.get('/:unitId/calculate', async (request, response) => {
  const { isOpa, isAdmin }  = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid, unitId } = request.params;

  const unit = await unitService.getUnit(armyBookUid, request.me.userId, unitId);

  if (unit) {
    const normalizedUnit = CalcHelper.normalizeUnit(unit);
    const preciseCost = calc.unitCost(normalizedUnit);
    if (preciseCost > 0) {
      const roundedCost = CalcHelper.round(preciseCost);
      response.status(200).json({ cost: roundedCost });
    }
  } else {
    response.status(400).json({});
  }
});

router.patch('/:unitId/calculate', async (request, response) => {
  const { isOpa, isAdmin }  = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid, unitId } = request.params;

  const unit = await unitService.getUnit(armyBookUid, request.me.userId, unitId);

  if (unit) {
    const normalizedUnit = CalcHelper.normalizeUnit(unit);
    /*
    let report = await calc.post('unit', { json: { unit: normalizedUnit }}).json();
    if (report && report.cost > 0) {
      const rawCost = report.cost;
      const cost = round(report.cost);
      const recalculatedUnit = {
        ...unit,
        cost,
        rawCost,
      };

      try {
        await pool.query(
          'UPDATE opr_companion.army_books ab SET units = jsonb_set( ' +
          'units, ' +
          'array[( ' +
          'SELECT ordinality::int-1 ' +
          'FROM opr_companion.army_books tempy, jsonb_array_elements(units) with ordinality ' +
          'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
          ')::text], ' +
          '$2::jsonb) ' +
          'WHERE uid = $3 AND user_id = $4',
          [unitId, `${JSON.stringify(recalculatedUnit)}`, armyBookUid, userId],
        );
        response.status(200).json(recalculatedUnit);
      } catch (e) {
        console.error(e);
        response.status(400).json({message: `Could not update unit#${unit.id}`});
      }
    }
     */
  } else {
    response.status(400).json({});
  }
});

router.patch('/:unitId/resync', async (request, response) => {
  const { isAdmin }  = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid, unitId } = request.params;

  const currentUnit = await unitService.getUnit(armyBookUid, request.me.userId, unitId);
  if (!currentUnit.sync) {
    response.status(404).json({message: 'Unit has no sync config.'});
    return;
  }

  const parent = await unitService.getUnit(currentUnit.sync.parentArmyBookId, request.me.userId, currentUnit.sync.unitId);

  // new Set([...parent.upgrades, ...currentUnit.upgrades].filter(i => typeof i === 'string'))
  let updatedUnit = {
    ...currentUnit,
    size: parent.size,
    quality: parent.quality,
    defense: parent.defense,
    upgrades: parent.upgrades,
    equipment: parent.equipment,
    specialRules: parent.specialRules,
  };

  if (currentUnit?.sync?.patch) {
    let { patch } = currentUnit.sync;
    patch.forEach((pat) => {
      if (pat.op === 'remove') {
        const i = updatedUnit.specialRules.findIndex((sr) => sr.name === pat.value.name);
        const patchRemove = { op: 'remove', path: `/specialRules/${i}`, value: i };
        applyPatch(updatedUnit, [patchRemove]);
      } else {
        applyPatch(updatedUnit, [pat]);
      }
    });
  }

  // const associatedPackages = await getUpgradePackage(armyBookUid, userId, upgradePackageId);
  // fetch used special rules

  await unitService.updateUnit(armyBookUid, request.me.userId, updatedUnit.id, updatedUnit);

  response.status(200).json({...updatedUnit});
});

export default router;
