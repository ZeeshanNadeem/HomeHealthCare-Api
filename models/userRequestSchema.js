const mongoose = require("mongoose");
const Joi = require("joi");
const { organizationSchema } = require("./organizationSchema");
const { servicesSchema } = require("./servicesSchema");
const userRequestSchema = new mongoose.Schema({
  Organization: {
    type: organizationSchema,
    required: true,
  },
  Service: {
    type: servicesSchema,
    required: true,
  },
  Schedule: {
    type: String,
    required: true,
  },
  Time: {
    type: String,
    required: true,
  },
  OnlyOnce: {
    type: Boolean,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  PhoneNo: {
    type: Number,
    required: true,
  },
});

const UserRequest = mongoose.model("UserRequests", userRequestSchema);

function validateUserRequest(name) {
  const schema = Joi.object({
    OrganizationID: Joi.objectId().required(),

    Time: Joi.string().required(),
    ServiceID: Joi.objectId().required(),
    Schedule: Joi.string().required(),
    OnlyOnce: Joi.boolean().required(),
    Address: Joi.string().required(),
    PhoneNo: Joi.number().required(),
  });
  return schema.validate(name);
}

module.exports.userRequestSchema = organizationSchema;
module.exports.UserRequest = UserRequest;
module.exports.validateUserRequest = validateUserRequest;
