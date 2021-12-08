const mongoose = require("mongoose");
const Joi = require("joi");
const { qualificationSchema } = require("./qualificationSchema");
const { organizationSchema } = require("./organizationSchema");

const { staffTypeSchema } = require("./StaffTypeSchema");
const staffSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  // dateOfBirth: {
  //   type: String,
  //   required: true,
  // },
  staffSpeciality: {
    type: staffTypeSchema,
    required: true,
  },
  qualification: {
    type: qualificationSchema,
    required: true,
  },
  availabilityFrom: {
    type: String,
    required: true,
  },
  availabilityTo: {
    type: String,
    required: true,
  },
  availabileDayFrom: {
    type: String,
    required: true,
  },
  availabileDayTo: {
    type: String,
    required: true,
  },
  // email: {
  //   type: String,
  //   required: true,
  // },
  phone: {
    type: String,
    required: true,
  },
  Organization: {
    type: organizationSchema,
    required: true,
  },
});

const Staff = mongoose.model("Staff", staffSchema);

function validateStaff(Staff) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    // dateOfBirth: Joi.string().required(),
    serviceID: Joi.objectId().required(),
    qualificationID: Joi.objectId().required(),
    availabilityFrom: Joi.string().required(),
    availabilityTo: Joi.string().required(),
    availabileDayFrom: Joi.string().required(),
    availabileDayTo: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    Organization: Joi.object().required(),
  });
  return schema.validate(Staff);
}

module.exports.Staff = Staff;
module.exports.validateStaff = validateStaff;
module.exports.staffSchema = staffSchema;
