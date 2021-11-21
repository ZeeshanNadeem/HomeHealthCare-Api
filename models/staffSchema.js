const mongoose = require("mongoose");
const Joi = require("joi");
const { qualificationSchema } = require("./qualificationSchema");

const { staffTypeSchema } = require("./StaffTypeSchema");
const staffSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  staffType: {
    type: staffTypeSchema,
    required: true,
  },
  qualification: {
    type: qualificationSchema,
    required: true,
  },
  availabilityForm: {
    type: String,
    required: true,
  },
  availabilityTo: {
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
});

const Staff = mongoose.model("Staff", staffSchema);

function validateStaff(Staff) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    dateOfBirth: Joi.string().required(),
    staffTypeID: Joi.objectId().required(),
    qualificationID: Joi.objectId().required(),
    availabilityForm: Joi.string().required(),
    availabilityTo: Joi.string().required(),
    // email: Joi.string().required(),
    phone: Joi.string().required(),
  });
  return schema.validate(Staff);
}

module.exports.Staff = Staff;
module.exports.validateStaff = validateStaff;
module.exports.staffSchema = staffSchema;
