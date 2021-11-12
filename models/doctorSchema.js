const mongoose = require("mongoose");
const { qualificationSchema } = require("./qualificationSchema");
const Joi = require("joi");
const doctorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  qualification: {
    type: qualificationSchema,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const Doctor = mongoose.model("doctor", doctorSchema);

function validateDoctor(doctor) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    dateOfBirth: Joi.string().required(),
    qualificationID: Joi.objectId().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });
  return schema.validate(doctor);
}

module.exports.Doctor = Doctor;
module.exports.validateDoctor = validateDoctor;
