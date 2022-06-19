const mongoose = require("mongoose");
const Joi = require("joi");
const { staffSchema } = require("./staffSchema");
const { organizationSchema } = require("./organizationSchema");
const { independentServicesSchema } = require("./IndependentServicesSchema");
const { servicesSchema } = require("./servicesSchema");
const { userSchema } = require("./userSchema");
const { boolean } = require("joi");
const serviceRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  user: {
    type: userSchema,
    required: true,
  },
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
  // IndependentService: {
  //   type: independentServicesSchema ||,
  //   // required: true,
  // },
  Schedule: {
    type: String,
    required: true,
  },
  ServiceNeededTime: {
    type: String,
    required: true,
  },
  // ServiceNeededTo: {
  //   type: String,
  //   required: true,
  // },
  // Recursive: {
  //   type: Boolean,
  //   required: true,
  // },
  Address: {
    type: String,
    required: true,
  },
  PhoneNo: {
    type: String,
    required: true,
  },
  City: {
    type: String,
  },
  Email: {
    type: String,
    required: true,
  },
  rated: {
    type: Boolean,
    required: true,
  },
  VaccinationPlan: {
    type: Boolean,
  },
  totalMeetingsRequested: {
    type: Number,
  },
  lat: {
    type: String,
  },
  lng: {
    type: String,
  },
  markers: {
    type: [Object],
  },
});

serviceRequestSchema.set("timestamps", true);
const ConfirmService = mongoose.model("ConfirmService", serviceRequestSchema);

function validateUserRequest(name) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    userID: Joi.objectId().required(),
    staffMemberID: Joi.objectId(),
    OrganizationID: Joi.objectId(),

    vaccination: Joi.boolean(),
    ServiceNeededTime: Joi.string().required(),
    ServiceID: Joi.string().required(),
    Schedule: Joi.string().required(),
    // Recursive: Joi.boolean().required(),
    Address: Joi.string().required(),
    PhoneNo: Joi.string().required(),
    email: Joi.string().min(5).max(255).required().email(),
    city: Joi.string(),
    totalMeetingsRequested: Joi.number(),
    lat: Joi.string(),
    lng: Joi.string(),
    // markers:Joi.array()
  });
  return schema.validate(name);
}

module.exports.userRequestSchema = organizationSchema;
module.exports.ConfirmService = ConfirmService;
module.exports.validateUserRequest = validateUserRequest;
