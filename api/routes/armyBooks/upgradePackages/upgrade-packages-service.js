import { pool } from '../../../db';

export async function addUpgradePackage(armyBookUid, userId, upgradePackage) {
  await pool.query(
    'UPDATE opr_companion.army_books SET upgrade_packages = upgrade_packages || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(upgradePackage)}]`, armyBookUid, userId],
  );
  return upgradePackage;
}

export async function getUpgradePackages(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT upgrade_packages AS "upgradePackages" ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].upgradePackages;
}

export async function getUpgradePackage(armyBookUid, userId, upgradePackageId) {
  const { rows } = await pool.query(
    'SELECT upgrade_packages AS "upgradePackages" ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].upgradePackages.find(upgradePackage => upgradePackage.uid === upgradePackageId);
}

export async function updateUpgradePackages(armyBookUid, userId, upgradePackages) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET upgrade_packages = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(upgradePackages)}`, armyBookUid, userId],
  );
}

export async function updateUpgradePackage(armyBookUid, userId, upgradePackageId, upgradePackage) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET upgrade_packages = jsonb_set( ' +
    'upgrade_packages, ' +
    'array[( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(upgrade_packages) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'uid\' = $1 ' +
    ')::text], ' +
    '$2::jsonb) ' +
    'WHERE uid = $3 AND user_id = $4',
    [upgradePackageId, `${JSON.stringify(upgradePackage)}`, armyBookUid, userId],
  );
}

export async function deleteUpgradePackage(armyBookUid, userId, upgradePackageId) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET upgradePackages = upgradePackages #- ' +
    'array( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(upgrade_packages) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'uid\' = $1 ' +
    ')::text[] ' +
    'WHERE uid = $2 AND user_id = $3',
    [ upgradePackageId, armyBookUid, userId ],
  );
}
