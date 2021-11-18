const mongoose = require("mongoose");

const Joi = require("joi");
const { staffDuttiesSchema } = require("./staffDutiesSchema");

const bookedSlotsSchema = new mongoose.Schema({
  staffDuty: {
    type: staffDuttiesSchema,
    required: true,
  },
  BookedSlotFrom: {
    type: String,
    required: true,
  },
  BookedSlotTo: {
    type: String,
    required: true,
  },
});

const BookedSlots = mongoose.model("BookedSlots", bookedSlotsSchema);

function validateBookedSlots(name) {
  const schema = Joi.object({
    staffDutyID: Joi.objectId().required(),
    BookedSlotFrom: Joi.string().required(),
    BookedSlotTo: Joi.string().required(),
  });
  return schema.validate(name);
}

module.exports.bookedSlotsSchema = bookedSlotsSchema;
module.exports.BookedSlots = BookedSlots;
module.exports.validateBookedSlots = validateBookedSlots;
