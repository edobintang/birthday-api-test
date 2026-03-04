const { DateTime } = require("luxon");
const User = require("../models/User");

function isBirthdayMatch(user, localTime) {
  const birthday = DateTime.fromISO(user.birthday, { zone: "utc" });
  if (!birthday.isValid) {
    return false;
  }
  return birthday.month === localTime.month && birthday.day === localTime.day;
}

async function runBirthdayJob(now = new Date()) {
  const users = await User.find({});
  const sent = [];

  for (const user of users) {
    const localTime = DateTime.fromJSDate(now, { zone: "utc" }).setZone(user.timezone);
    if (!localTime.isValid) {
      continue;
    }

    const isNineAm = localTime.hour === 9 && localTime.minute === 0;
    const isBirthdayToday = isBirthdayMatch(user, localTime);
    const notSentYet = user.lastNotifiedYear !== localTime.year;

    if (isNineAm && isBirthdayToday && notSentYet) {
      console.log(`Happy Birthday, ${user.name}!`);
      user.lastNotifiedYear = localTime.year;
      await user.save();
      sent.push(user.email);
    }
  }

  return sent;
}

module.exports = {
  runBirthdayJob
};
