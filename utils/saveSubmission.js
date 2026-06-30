const Submission = require("../models/Submission");

async function saveSubmission(type, data) {
  return Submission.create({ type, data });
}

module.exports = { saveSubmission };
