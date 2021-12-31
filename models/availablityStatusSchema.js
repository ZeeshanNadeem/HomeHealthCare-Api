const mongoose = require("mongoose");
const { qualificationSchema } = require("./qualificationSchema");
const Joi = require("joi");
const availabilitySchema = new mongoose.Schema({
  SlotTime: {
    type: String,
    required: true,
  },
  SlotBooked: {
    type: Boolean,
    required: true,
  },
});

const Available = mongoose.model("availability", availabilitySchema);

function validateAvailabilty(availability) {
  const schema = Joi.object({
    SlotTime: Joi.string().required(),
    SlotBooked: Joi.boolean().required(),
  });
  return schema.validate(availability);
}

module.exports.Available = Available;
module.exports.validateAvailabilty = validateAvailabilty;
