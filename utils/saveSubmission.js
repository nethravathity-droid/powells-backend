const Submission = require("../models/Submission");

async function saveSubmission(type, data) {
  try {
    await Submission.create({ type, data });
  } catch (err) {
    console.error("SUBMISSION SAVE ERROR:", err.message);
  }
}

module.exports = { saveSubmission };
