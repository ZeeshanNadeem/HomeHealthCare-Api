const mongoose = require("mongoose");
const Joi = require("joi");
const staffTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  servicePrice: {
    type: String,
    required: true,
  },
});

const StaffType = mongoose.model("staffType", staffTypeSchema);

function validateStaffType(name) {
  const schema = Joi.object({
    name: Joi.string().required(),
    servicePrice: Joi.string().required(),
  });
  return schema.validate(name);
}

module.exports.staffTypeSchema = staffTypeSchema;
module.exports.StaffType = StaffType;
module.exports.validateStaffType = validateStaffType;
