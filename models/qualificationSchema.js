const mongoose = require("mongoose");
const Joi = require("joi");
const qualificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Qualification = mongoose.model("qualification", qualificationSchema);

function validateQualification(name) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(name);
}

module.exports.qualificationSchema = qualificationSchema;
module.exports.Qualification = Qualification;
module.exports.validateQualification = validateQualification;
