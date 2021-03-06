const mongoose = require("mongoose");
const { organizationSchema } = require("./organizationSchema");
const { servicesSchema } = require("./servicesSchema");
// const { staffSchema } = require("./staffSchema");
const Joi = require("joi");

const staffDuttiesSchema = new mongoose.Schema({
  // staffMemberAssigned: {
  //   type: staffSchema,
  //   required: true,
  // },
  service: {
    type: servicesSchema,
    required: true,
  },
  serviceOrganization: {
    type: organizationSchema,
    required: true,
  },
  Day: {
    type: String,
    required: true,
  },
  From: {
    type: String,
    required: true,
  },
  To: {
    type: String,
    required: true,
  },
});

const StaffDuties = mongoose.model("StaffDuties", staffDuttiesSchema);

function validateStaffDuty(name) {
  const schema = Joi.object({
    // staffMemberId: Joi.objectId().required(),
    serviceID: Joi.objectId().required(),
    serviceOrganization: Joi.objectId().required(),
    Day: Joi.string().required(),
    From: Joi.string().required(),
    To: Joi.string().required(),
  });
  return schema.validate(name);
}

module.exports.staffDuttiesSchema = staffDuttiesSchema;
module.exports.StaffDuties = StaffDuties;
module.exports.validateStaffDuty = validateStaffDuty;
