const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["contact", "inquiry", "subscribe", "channel-partner"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
