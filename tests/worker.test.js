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

  it("does not send outside 9 AM", async () => {
    await User.create({
      name: "Alex",
      email: "alex@example.com",
      birthday: "1992-02-28",
      timezone: "America/New_York"
    });

    const now = DateTime.fromISO("2026-02-28T09:01:00", {
      zone: "America/New_York"
    }).toJSDate();

    const sent = await runBirthdayJob(now);
    expect(sent).toHaveLength(0);
  });

  it("does not send when birthday does not match", async () => {
    await User.create({
      name: "Alex",
      email: "alex@example.com",
      birthday: "1992-02-27",
      timezone: "America/New_York"
    });

    const now = DateTime.fromISO("2026-02-28T09:00:00", {
      zone: "America/New_York"
    }).toJSDate();

    const sent = await runBirthdayJob(now);
    expect(sent).toHaveLength(0);
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

  it("skips users with invalid timezone", async () => {
    await User.create({
      name: "Alex",
      email: "alex@example.com",
      birthday: "1992-02-28",
      timezone: "Invalid/Zone"
    });

    const now = DateTime.fromISO("2026-02-28T09:00:00", {
      zone: "utc"
    }).toJSDate();

    const sent = await runBirthdayJob(now);
    expect(sent).toHaveLength(0);
  });

  it("updates lastNotifiedYear after sending", async () => {
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

    const updated = await User.findOne({ email: "alex@example.com" });
    expect(updated.lastNotifiedYear).toBe(2026);
  });

  it("sends only to users whose local time is 9 AM", async () => {
    await User.create({
      name: "NY User",
      email: "ny@example.com",
      birthday: "1992-02-28",
      timezone: "America/New_York"
    });

    await User.create({
      name: "LA User",
      email: "la@example.com",
      birthday: "1992-02-28",
      timezone: "America/Los_Angeles"
    });

    const now = DateTime.fromISO("2026-02-28T14:00:00", {
      zone: "utc"
    }).toJSDate();

    const sent = await runBirthdayJob(now);
    expect(sent).toEqual(["ny@example.com"]);
  });
});
