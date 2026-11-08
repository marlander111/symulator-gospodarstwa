// Climate of typical farming regions of Poland: approximate long-term averages, enough to plan
// the grazing season and to scale yields. Names: locales/<language>.json → locations.<id>.
//
// The first location is the reference: the yield and season sliders describe a farm there, and
// every other location scales the yields up or down (see computeClimateFactors in soil.js).

/**
 * latitude/longitude: [degrees, minutes]; altitude: [lowest, highest] m above sea level;
 * rainfallMm: per year; temperatureC: [low, high] yearly mean; grazingStart/End: [month, day].
 */
const LOCATIONS = [
  {
    id: 'sudetenForeland',
    latitude: [51, 7],
    longitude: [15, 35],
    altitude: [250, 400],
    rainfallMm: 680,
    temperatureC: [7.6, 8],
    grazingStart: [4, 20],
    grazingEnd: [10, 31],
  },
  {
    id: 'sudetes',
    latitude: [50, 50],
    longitude: [16, 0],
    altitude: [400, 800],
    rainfallMm: 850,
    temperatureC: [5.8, 7],
    grazingStart: [5, 1],
    grazingEnd: [10, 15],
  },
  {
    id: 'lowerSilesianPlain',
    latitude: [51, 0],
    longitude: [17, 0],
    altitude: [120, 200],
    rainfallMm: 580,
    temperatureC: [8.5, 9],
    grazingStart: [4, 10],
    grazingEnd: [11, 5],
  },
  {
    id: 'lubuskie',
    latitude: [52, 10],
    longitude: [15, 20],
    altitude: [50, 150],
    rainfallMm: 560,
    temperatureC: [8.5, 9],
    grazingStart: [4, 10],
    grazingEnd: [11, 1],
  },
  {
    id: 'wielkopolska',
    latitude: [52, 25],
    longitude: [17, 0],
    altitude: [60, 120],
    rainfallMm: 520,
    temperatureC: [8.5, 9],
    grazingStart: [4, 15],
    grazingEnd: [10, 31],
  },
  {
    id: 'westPomerania',
    latitude: [53, 35],
    longitude: [15, 30],
    altitude: [30, 150],
    rainfallMm: 600,
    temperatureC: [8.2, 8.7],
    grazingStart: [4, 15],
    grazingEnd: [10, 31],
  },
  {
    id: 'pomeraniaKashubia',
    latitude: [54, 10],
    longitude: [18, 0],
    altitude: [100, 250],
    rainfallMm: 700,
    temperatureC: [7.3, 7.8],
    grazingStart: [5, 1],
    grazingEnd: [10, 25],
  },
  {
    id: 'warmiaMasuria',
    latitude: [53, 45],
    longitude: [21, 0],
    altitude: [100, 200],
    rainfallMm: 620,
    temperatureC: [7, 7.5],
    grazingStart: [5, 5],
    grazingEnd: [10, 20],
  },
  {
    id: 'podlasie',
    latitude: [53, 10],
    longitude: [23, 0],
    altitude: [120, 180],
    rainfallMm: 580,
    temperatureC: [6.8, 7.3],
    grazingStart: [5, 5],
    grazingEnd: [10, 15],
  },
  {
    id: 'mazovia',
    latitude: [52, 15],
    longitude: [21, 0],
    altitude: [80, 150],
    rainfallMm: 540,
    temperatureC: [8, 8.5],
    grazingStart: [4, 20],
    grazingEnd: [10, 25],
  },
  {
    id: 'centralPoland',
    latitude: [51, 45],
    longitude: [19, 30],
    altitude: [150, 250],
    rainfallMm: 570,
    temperatureC: [7.8, 8.3],
    grazingStart: [4, 20],
    grazingEnd: [10, 25],
  },
  {
    id: 'lublinRoztocze',
    latitude: [50, 35],
    longitude: [23, 0],
    altitude: [220, 350],
    rainfallMm: 620,
    temperatureC: [7.5, 8],
    grazingStart: [4, 25],
    grazingEnd: [10, 20],
  },
  {
    id: 'lesserPolandFoothills',
    latitude: [49, 40],
    longitude: [20, 40],
    altitude: [300, 550],
    rainfallMm: 780,
    temperatureC: [7.5, 8],
    grazingStart: [4, 25],
    grazingEnd: [10, 20],
  },
  {
    id: 'mountains',
    latitude: [49, 30],
    longitude: [19, 50],
    altitude: [600, 900],
    rainfallMm: 950,
    temperatureC: [5.5, 6.5],
    grazingStart: [5, 15],
    grazingEnd: [10, 10],
  },
];

const LOCATION_IDS = LOCATIONS.map(location => location.id);

/** Returns the location with this id (the reference location when the id is unknown). */
function locationById(id) {
  return LOCATIONS.find(location => location.id === id) || LOCATIONS[0];
}

/** Day of the year (1–365) of a [month, day] date in a non-leap year. */
function dayOfYear([month, day]) {
  return Math.round((Date.UTC(2025, month - 1, day) - Date.UTC(2025, 0, 0)) / 86400000);
}

/** Days from the start to the end of the grazing season, both included. */
function grazingSeasonDays(location) {
  return dayOfYear(location.grazingEnd) - dayOfYear(location.grazingStart) + 1;
}
