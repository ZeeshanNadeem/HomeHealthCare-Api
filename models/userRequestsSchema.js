const mongoose = require("mongoose");
const { servicesSchema } = require("./servicesSchema");

const Joi = require("joi");
const userRequestsSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  requestType: {
    type: servicesSchema,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const userRequests = mongoose.model("user_Requests", userRequestsSchema);

function validateUserRequest(request) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    requestID: Joi.objectId().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
  });
  return schema.validate(request);
}

module.exports.userRequests = userRequests;
module.exports.validateUserRequest = validateUserRequest;
