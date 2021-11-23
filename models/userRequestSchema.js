const mongoose = require("mongoose");
const Joi = require("joi");
const { staffSchema } = require("./staffSchema");
const { organizationSchema } = require("./organizationSchema");
const { servicesSchema } = require("./servicesSchema");
const userRequestSchema = new mongoose.Schema({
  staffMemberAssigned: {
    type: staffSchema,
    required: true,
  },
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
  ServiceNeededFrom: {
    type: String,
    required: true,
  },
  ServiceNeededTo: {
    type: String,
    required: true,
  },
  OnlyOnce: {
    type: String,
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
    staffMemberID: Joi.objectId().required(),
    OrganizationID: Joi.objectId().required(),
    ServiceNeededFrom: Joi.string().required(),
    ServiceNeededTo: Joi.string().required(),
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