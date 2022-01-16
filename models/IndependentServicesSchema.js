const mongoose = require("mongoose");
const { organizationSchema } = require("./organizationSchema");
const Joi = require("joi");

const independentServicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  serviceOrganization: {
    type: organizationSchema,
    required: true,
  },
  servicePrice: {
    type: String,
    required: true,
  },
});

const Service = mongoose.model(
  "Independent Services",
  independentServicesSchema
);

function validateServiceIndependent(name) {
  const schema = Joi.object({
    serviceName: Joi.string().required(),
    OrganizationID: Joi.objectId().required(),
    servicePrice: Joi.number().required(),
  });
  return schema.validate(name);
}

module.exports.independentServicesSchema = independentServicesSchema;
module.exports.ServiceIndependent = Service;
module.exports.validateServiceIndependent = validateServiceIndependent;
