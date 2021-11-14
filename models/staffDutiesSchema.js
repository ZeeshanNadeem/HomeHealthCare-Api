const mongoose = require("mongoose");
const Joi = require("joi");

const staffDuttiesSchema = new mongoose.Schema({
  serviceID: {
    type: String,
    required: true,
  },
  Day: {
    type: String,
    required: true,
  },
  From: {
    type: String,
    required: true,
  },
  To: {
    type: String,
    required: true,
  },
});

const StaffDuties = mongoose.model("StaffDuties", staffDuttiesSchema);

function validateStaffDuty(name) {
  const schema = Joi.object({
    serviceID: Joi.objectId().required(),
    Day: Joi.string().required(),
    From: Joi.string().required(),
    To: Joi.string().required(),
  });
  return schema.validate(name);
}

module.exports.staffDuttiesSchema = staffDuttiesSchema;
module.exports.StaffDuties = StaffDuties;
module.exports.validateStaffDuty = validateStaffDuty;
