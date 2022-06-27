import Router from 'express-promise-router';
import { nanoid } from 'nanoid';
import UserAccountService from '../services/userAccountService';
import * as armyBookService from './armyBooks/army-book-service';

const router = new Router();

router.get('/migrate/equipment-label-to-name', async (request, response) => {
  const { roles } = await UserAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (roles.includes('admin') === false) {
    response.status(403).json({ message: 'Not Allowed.' });
    return;
  }

  const log = [];
  const armyBooks = await armyBookService.getAll();

  for (const armyBook of armyBooks) {
    if (armyBook.units) {
      const migratedUnits = armyBook.units.map((unit) => {
        if (unit.equipment) {
          const equipment = unit.equipment.map((equip) => {
            if (equip.name && equip.label && equip.name.localeCompare(equip.label) !== 0) {
              console.warn(`[${armyBook.uid}] Weapon string diff -> label(${equip.label}) vs name(${equip.name}).`);
              log.push(`[${armyBook.uid}] ${armyBook.name}::${unit.name} Weapon string diff -> label(${equip.label}) vs name(${equip.name}).`);
            }
            equip.name = equip.label || equip.name;
            delete equip.label;
            return equip;
          });
          return {
            ...unit,
            equipment,
          };
        } else {
          return [];
        }
      });
      await armyBookService.setUnits(armyBook.uid, armyBook.userId, migratedUnits);
    }
  }
  response.status(200).json({ message: 'done', log });
});

router.get('/migrate/upgrades-add-relation-ids', async (request, response) => {
  const { roles } = await UserAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (roles.includes('admin') === false) {
    response.status(403).json({ message: 'Not Allowed.' });
    return;
  }

  const armyBooks = await armyBookService.getAll();

  for (const armyBook of armyBooks) {
    if (armyBook.upgradePackages) {
      const migratedPackages = armyBook.upgradePackages.map((pack) => {
        if (pack.sections) {
          const sections = pack.sections.map((section) => {
            delete section.id;
            section.uid = section.uid || nanoid(7);
            section.parentPackageUid = pack.uid;
            if (section.options && Array.isArray(section.options)) {
              const options = section.options.map((option) => {
                delete option.id;
                option.uid = option.uid || nanoid(7);
                option.parentSectionUid = section.uid;
                option.parentPackageUid = pack.uid;
                return option;
              });
              return {
                ...section,
                options,
              };
            } else {
              return section;
            }
          });
          return {
            ...pack,
            sections,
          };
        } else {
          return pack;
        }
      });
      await armyBookService.setUpgradePackages(armyBook.uid, armyBook.userId, migratedPackages);
    }
  }
  response.status(200).json({ message: 'done' });
});

export default router;
