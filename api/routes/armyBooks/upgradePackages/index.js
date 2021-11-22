import Router from 'express-promise-router';
import * as upgradePackagesService from './upgrade-packages-service';

const router = new Router({mergeParams: true});

router.get('/', async (request, response) => {
  const { armyBookUid } = request.params;
  const upgradePackages = await upgradePackagesService.getUpgradePackages(armyBookUid, request.me.userId);
  response.status(200).json(upgradePackages);
});

router.post('/', async (request, response) => {
  const { armyBookUid } = request.params;
  const upgradePackages = await upgradePackagesService.addUpgradePackage(armyBookUid, request.me.userId, request.body);
  response.status(200).json(upgradePackages);
});

router.get('/:upgradePackageUid', async (request, response) => {
  const { armyBookUid, upgradePackageUid } = request.params;
  const upgradePackage = await upgradePackagesService.getUpgradePackage(armyBookUid, request.me.userId, upgradePackageUid);
  if (upgradePackage.length === 1) {
    response.status(200).json(upgradePackage);
  } else {
    response.status(404).json();
  }
});

router.patch('/:upgradePackageUid', async (request, response) => {
  const { armyBookUid, upgradePackageUid } = request.params;
  const upgradePackage = await upgradePackagesService.updateUpgradePackage(armyBookUid, request.me.userId, upgradePackageUid, request.body);
  response.status(200).json(upgradePackage);
});

router.delete('/:upgradePackageUid', async (request, response) => {
  const { armyBookUid, upgradePackageUid } = request.params;
  await upgradePackagesService.deleteUpgradePackage(armyBookUid, request.me.userId, upgradePackageUid);
  response.status(204).json();
});

export default router;
