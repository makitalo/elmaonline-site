import { forEach, has } from 'lodash';
import moment from 'moment';

export const admins = cup => {
  let a = [cup.KuskiIndex];
  if (cup.ReadAccess) {
    a = [
      cup.KuskiIndex,
      ...cup.ReadAccess.split('-').map(r => parseInt(r, 10)),
    ];
  }
  return a;
};

export const points = [
  100,
  85,
  75,
  70,
  65,
  60,
  56,
  52,
  49,
  46,
  44,
  42,
  40,
  38,
  36,
  35,
  34,
  33,
  32,
  31,
  30,
  29,
  28,
  27,
  26,
  25,
  24,
  23,
  22,
  21,
  20,
  19,
  18,
  17,
  16,
  15,
  14,
  13,
  12,
  11,
  10,
  9,
  8,
  7,
  6,
  5,
  4,
  3,
  2,
  1,
];

export const filterResults = (events, ownerId = [], loggedId = 0) => {
  const filtered = [];
  // loop events
  forEach(events, (eventValues, eventIndex) => {
    const event = eventValues.dataValues;
    filtered.push(event);
    filtered[eventIndex].StartTime = moment(
      filtered[eventIndex].StartTime,
    ).format('X');
    filtered[eventIndex].EndTime = moment(filtered[eventIndex].EndTime).format(
      'X',
    );
    const sortedTimes = event.CupTimes.sort((a, b) => {
      if (a.dataValues.Time === b.dataValues.Time) {
        return a.dataValues.TimeIndex - b.dataValues.TimeIndex;
      }
      return a.dataValues.Time - b.dataValues.Time;
    });
    const kuskisIn = [];
    const filteredResults = [];
    // loop results and insert best result from each kuski
    forEach(sortedTimes, timeValues => {
      const time = timeValues.dataValues;
      if (time.TimeExists) {
        if (kuskisIn.indexOf(time.KuskiIndex) === -1) {
          filteredResults.push(time);
          kuskisIn.push(time.KuskiIndex);
        }
      }
    });
    // iterate results to assign points
    const drawResults = {};
    forEach(filteredResults, (result, pos) => {
      // check for draw results
      const draws = filteredResults.filter(r => r.Time === result.Time);
      if (draws.length > 1) {
        if (!has(drawResults, result.Time)) {
          drawResults[result.Time] = pos;
        }
        let combinedPoints = 0;
        for (let p = 0; p < draws.length; p += 1) {
          const drawPos = drawResults[result.Time] + p;
          combinedPoints += points[drawPos] ? points[drawPos] : 1;
        }
        const drawPoints = combinedPoints / draws.length;
        filteredResults[pos].Points = drawPoints;
      } else {
        // otherwise assign points normally
        filteredResults[pos].Points = points[pos] ? points[pos] : 1;
      }
    });
    filtered[eventIndex].CupTimes = [];
    if (filtered[eventIndex].EndTime < moment().format('X')) {
      if (filtered[eventIndex].Updated) {
        if (filtered[eventIndex].ShowResults) {
          filtered[eventIndex].CupTimes = filteredResults;
        } else if (ownerId.length > 0 && ownerId.indexOf(loggedId) > -1) {
          filtered[eventIndex].CupTimes = filteredResults;
        }
      }
    }
  });
  return filtered;
};

export const generateEvent = (event, cup, times, cuptimes) => {
  const insertBulk = [];
  const updateBulk = [];
  // loop times and find finished runs
  forEach(times, t => {
    if (t.Finished === 'F' || (event.AppleBugs && t.Finished === 'B')) {
      if (t.Driven > event.StartTime && t.Driven < event.EndTime) {
        const exists = cuptimes.filter(
          c => c.KuskiIndex === t.KuskiIndex && c.Time === t.Time,
        );
        // update cup times if replay is uploaded
        if (exists.length > 0) {
          updateBulk.push({
            TimeIndex: t.TimeIndex,
            TimeExists: 1,
            CupTimeIndex: exists[0].CupTimeIndex,
          });
          // add to cup times if not uploaded and replay not required
        } else if (!cup.ReplayRequired) {
          insertBulk.push({
            CupIndex: event.CupIndex,
            KuskiIndex: t.KuskiIndex,
            TimeIndex: t.TimeIndex,
            Time: t.Time,
            TimeExists: 1,
            RecData: null,
          });
        }
      }
      // find apple results
    } else if (cup.AppleResults && (t.Finished === 'D' || t.Finished === 'E')) {
      if (t.Driven > event.StartTime && t.Driven < event.EndTime) {
        const exists = cuptimes.filter(
          c =>
            c.KuskiIndex === t.KuskiIndex &&
            c.Time === 9999000 + (1000 - t.Apples),
        );
        // insert only if replay uploaded
        if (exists.length > 0) {
          updateBulk.push({
            TimeIndex: t.TimeIndex,
            TimeExists: 1,
            CupTimeIndex: exists[0].CupTimeIndex,
          });
        }
      }
    }
  });
  return { insertBulk, updateBulk };
};
