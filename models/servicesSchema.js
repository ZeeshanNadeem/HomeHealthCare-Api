const mongoose = require("mongoose");
const Joi = require("joi");
const servicesSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  serviceOrgranization: {
    type: String,
    required: true,
  },
  servicePrice: {
    type: String,
    required: true,
  },
});

const Service = mongoose.model("services", servicesSchema);

function validateService(name) {
  const schema = Joi.object({
    serviceName: Joi.string().required(),
    serviceOrgranization: Joi.string().required(),
    servicePrice: Joi.number().required(),
  });
  return schema.validate(name);
}

module.exports.servicesSchema = servicesSchema;
module.exports.Service = Service;
module.exports.validateService = validateService;