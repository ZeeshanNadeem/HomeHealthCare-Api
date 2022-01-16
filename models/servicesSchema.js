const mongoose = require("mongoose");
const Joi = require("joi");
const { organizationSchema } = require("./organizationSchema");
const { independentServicesSchema } = require("./IndependentServicesSchema");
const { userSchema } = require("./userSchema");
const servicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    // required: true,
  },
  IndependentService: {
    type: independentServicesSchema,
  },
  serviceOrgranization: {
    type: organizationSchema,
    required: true,
  },
  servicePrice: {
    type: String,
    // required: true,
  },
  user: {
    type: userSchema,
  },
});

const Service = mongoose.model("services", servicesSchema);

function validateService(name) {
  const schema = Joi.object({
    serviceName: Joi.string(),
    serviceID: Joi.string(),
    IndependentService: Joi.objectId(),
    serviceOrgranization: Joi.objectId().required(),
    servicePrice: Joi.number(),
    userID: Joi.objectId(),
  });
  return schema.validate(name);
}

module.exports.servicesSchema = servicesSchema;
module.exports.Service = Service;
module.exports.validateService = validateService;
