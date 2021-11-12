const mongoose = require("mongoose");
const Joi = require("joi");
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Organization = mongoose.model("organization", organizationSchema);

function validateOrganization(name) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(name);
}

module.exports.organizationSchema = organizationSchema;
module.exports.Organization = Organization;
module.exports.validateOrganization = validateOrganization;
