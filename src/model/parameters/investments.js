// Parameters of the "investments" group: unit prices of the infrastructure items
// (data/infrastructure.js). Labels, units and hints: locales → parameters.<id>.

defineParameterGroup('investments', [
  // buildings
  { id: 'investCattleShed', min: 0, max: 15000, step: 250, defaultValue: 4500 },
  { id: 'investSheepShed', min: 0, max: 1500, step: 25, defaultValue: 400 },
  { id: 'investPigShelter', min: 0, max: 2000, step: 50, defaultValue: 500 },
  { id: 'investHorseStable', min: 0, max: 20000, step: 500, defaultValue: 6000 },
  { id: 'investRidingEquipment', min: 0, max: 40000, step: 500, defaultValue: 10000 },
  { id: 'investHenHouse', min: 0, max: 500, step: 10, defaultValue: 160 },
  { id: 'investBroilerPens', min: 0, max: 40, step: 1, defaultValue: 20 },
  { id: 'investOtherPoultryShelters', min: 0, max: 80, step: 1, defaultValue: 25 },
  { id: 'investRabbitHutches', min: 0, max: 1000, step: 50, defaultValue: 400 },
  { id: 'investHatchery', min: 0, max: 15000, step: 250, defaultValue: 4000 },
  { id: 'investPoultryTunnel', min: 0, max: 30000, step: 500, defaultValue: 5000 },
  // pasture
  { id: 'investElectricFencing', min: 0, max: 6000, step: 100, defaultValue: 1200 },
  { id: 'investPastureWater', min: 0, max: 30000, step: 500, defaultValue: 4000 },
  // dairy and processing rooms
  { id: 'investDairy', min: 0, max: 120000, step: 1000, defaultValue: 30000 },
  { id: 'investGoatDairy', min: 0, max: 80000, step: 1000, defaultValue: 15000 },
  { id: 'investCheeseRoom', min: 0, max: 120000, step: 1000, defaultValue: 25000 },
  { id: 'investProcessingRoom', min: 0, max: 150000, step: 5000, defaultValue: 45000 },
  { id: 'investPreservesKitchen', min: 0, max: 80000, step: 1000, defaultValue: 15000 },
  { id: 'investMeatColdStore', min: 0, max: 30000, step: 500, defaultValue: 6000 },
  // second-hand machinery
  { id: 'investTractor', min: 0, max: 120000, step: 1000, defaultValue: 25000 },
  { id: 'investHaymakingSet', min: 0, max: 60000, step: 1000, defaultValue: 12000 },
  { id: 'investArableImplements', min: 0, max: 60000, step: 1000, defaultValue: 10000 },
  { id: 'investManureHandling', min: 0, max: 40000, step: 1000, defaultValue: 10000 },
  { id: 'investLivestockTrailer', min: 0, max: 30000, step: 500, defaultValue: 8000 },
  // produce
  { id: 'investMarketGarden', min: 0, max: 150000, step: 5000, defaultValue: 60000 },
  { id: 'investBeehive', min: 0, max: 2000, step: 50, defaultValue: 900 },
  // anything else, typed in by the user
  { id: 'investOther', min: 0, max: 300000, step: 500, defaultValue: 0 },
  { id: 'investOtherLifetimeYears', min: 1, max: 30, step: 1, defaultValue: 10 },
]);

// "The farm already has it": one hidden switch per infrastructure item, set in the
// "Required infrastructure" panel.
defineParameterGroup(
  'infrastructure',
  INFRASTRUCTURE_ITEMS.map(item => ({
    id: ownedParameterId(item.id),
    type: 'boolean',
    defaultValue: false,
    hidden: true,
  }))
);
