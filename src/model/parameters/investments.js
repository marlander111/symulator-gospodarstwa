// Parameters of the "investments" group. Labels, units and hints: locales/pl.json → parameters.<id>.

defineParameterGroup('investments', [
  { id: 'investCattleShed', min: 0, max: 15000, step: 250, defaultValue: 4500 },
  { id: 'investSheepShed', min: 0, max: 1500, step: 25, defaultValue: 400 },
  { id: 'investHenHouse', min: 0, max: 500, step: 10, defaultValue: 160 },
  { id: 'investBroilerPens', min: 0, max: 40, step: 1, defaultValue: 20 },
  { id: 'investOtherPoultryShelters', min: 0, max: 80, step: 1, defaultValue: 25 },
  { id: 'investRabbitHutches', min: 0, max: 1000, step: 50, defaultValue: 400 },
  { id: 'investElectricFencing', min: 0, max: 6000, step: 100, defaultValue: 1200 },
  { id: 'investPastureWater', min: 0, max: 30000, step: 500, defaultValue: 4000 },
  { id: 'investDairy', min: 0, max: 120000, step: 1000, defaultValue: 30000 },
  { id: 'investCheeseRoom', min: 0, max: 120000, step: 1000, defaultValue: 25000 },
  { id: 'investMachinery', min: 0, max: 120000, step: 1000, defaultValue: 20000 },
  { id: 'investMarketGarden', min: 0, max: 150000, step: 5000, defaultValue: 60000 },
  { id: 'investBeehive', min: 0, max: 2000, step: 50, defaultValue: 900 },
  { id: 'investHatchery', min: 0, max: 15000, step: 250, defaultValue: 4000 },
  { id: 'investPoultryTunnel', min: 0, max: 30000, step: 500, defaultValue: 5000 },
  { id: 'investHorseStable', min: 0, max: 20000, step: 500, defaultValue: 6000 },
  { id: 'investProcessingRoom', min: 0, max: 150000, step: 5000, defaultValue: 45000 },
  { id: 'investOther', min: 0, max: 300000, step: 500, defaultValue: 0 },
  { id: 'investOtherLifetimeYears', min: 1, max: 30, step: 1, defaultValue: 10 },
]);
