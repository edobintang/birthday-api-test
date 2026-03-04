const { DateTime } = require("luxon");
const User = require("../src/models/User");
const { runBirthdayJob } = require("../src/worker/birthdayWorker");

describe("Birthday worker", () => {
  it("sends a birthday message at 9 AM local time", async () => {
    await User.create({
      name: "Alex",
      email: "alex@example.com",
      birthday: "1992-02-28",
      timezone: "America/New_York"
    });

    const now = DateTime.fromISO("2026-02-28T09:00:00", {
      zone: "America/New_York"
    }).toJSDate();

    const sent = await runBirthdayJob(now);
    expect(sent).toContain("alex@example.com");
  });

  it("does not send twice in the same year", async () => {
    await User.create({
      name: "Sam",
      email: "sam@example.com",
      birthday: "1992-02-28",
      timezone: "America/New_York",
      lastNotifiedYear: 2026
    });

    const now = DateTime.fromISO("2026-02-28T09:00:00", {
      zone: "America/New_York"
    }).toJSDate();

    const sent = await runBirthdayJob(now);
    expect(sent).toHaveLength(0);
  });
});
