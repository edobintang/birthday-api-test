const { DateTime, IANAZone } = require("luxon");
const validator = require("validator");

function isValidBirthday(value) {
  if (typeof value !== "string") {
    return false;
  }
  const dt = DateTime.fromISO(value, { zone: "utc" });
  return dt.isValid && dt.toISODate() === value;
}

function isValidTimezone(value) {
  return typeof value === "string" && IANAZone.isValidZone(value);
}

function validateCreate(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { isValid: false, errors: ["Request body is required"] };
  }

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Name is required");
  }

  if (!body.email || typeof body.email !== "string" || !validator.isEmail(body.email)) {
    errors.push("Valid email is required");
  }

  if (!body.birthday || !isValidBirthday(body.birthday)) {
    errors.push("Birthday must be an ISO 8601 date (YYYY-MM-DD)");
  }

  if (!body.timezone || !isValidTimezone(body.timezone)) {
    errors.push("Timezone must be a valid IANA timezone");
  }

  return { isValid: errors.length === 0, errors };
}

function validateUpdate(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { isValid: false, errors: ["Request body is required"] };
  }

  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      errors.push("Name must be a non-empty string");
    }
  }

  if ("email" in body) {
    if (typeof body.email !== "string" || !validator.isEmail(body.email)) {
      errors.push("Email must be valid");
    }
  }

  if ("birthday" in body) {
    if (!isValidBirthday(body.birthday)) {
      errors.push("Birthday must be an ISO 8601 date (YYYY-MM-DD)");
    }
  }

  if ("timezone" in body) {
    if (!isValidTimezone(body.timezone)) {
      errors.push("Timezone must be a valid IANA timezone");
    }
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateCreate,
  validateUpdate
};
