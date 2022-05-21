const mongoose = require("mongoose");
const Joi = require("joi");
const { staffSchema } = require("./staffSchema");
const { organizationSchema } = require("./organizationSchema");
const { servicesSchema } = require("./servicesSchema");
const { IndependentServicesSchema } = require("./IndependentServicesSchema");
const { userSchema } = require("./userSchema");
const { boolean } = require("joi");
const userRequestSchema = new mongoose.Schema({
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
  Schedule: {
    type: String,
    required: true,
  },
  ServiceNeededTime: {
    type: String,
    required: true,
  },

  // Recursive: {
  //   type: Boolean,
  //   required: true,
  // },
  Address: {
    type: String,
    required: true,
  },
  PhoneNo: {
    type: Number,
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
  NotificationViewed: {
    type: Boolean,
  },
  lat:{
    type:String
  },
  lng:{
    type:String
  },
   markers:{
    type:[Object]
  },
  reschedule:{
    type:Boolean
  },
  completed:{
    type:Boolean
  }
});

const UserRequest = mongoose.model("UserRequests", userRequestSchema);

function validateUserRequest(name) {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    userID: Joi.objectId().required(),
    staffMemberID: Joi.objectId().required(),
    OrganizationID: Joi.objectId().required(),
    ServiceNeededTime: Joi.string().required(),
    vaccination: Joi.boolean(),
    // ServiceNeededTo: Joi.string().required(),
    ServiceID: Joi.objectId().required(),
    Schedule: Joi.string().required(),
    // Recursive: Joi.boolean().required(),
    Address: Joi.string().required(),
    PhoneNo: Joi.number().required(),
    email: Joi.string().min(5).max(255).required().email(),
    city: Joi.string(),
    NotificationViewed: Joi.string(),
    lat:Joi.string(),
    lng:Joi.string(),
    markers:Joi.array(),
    reschedule:Joi.boolean(),
    completed:Joi.boolean(),
  });
  return schema.validate(name);
}

module.exports.userRequestSchema = organizationSchema;
module.exports.UserRequest = UserRequest;
module.exports.validateUserRequest = validateUserRequest;
