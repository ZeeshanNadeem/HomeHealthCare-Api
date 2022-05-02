const mongoose = require("mongoose");

const Joi = require("joi");
const { staffDuttiesSchema } = require("./staffDutiesSchema");
const { staffSchema } = require("./staffSchema");

const leaveSchema = new mongoose.Schema({
  leaveFrom: {
    type: String,
    required: true,
  },
  leaveTo: {
    type: String,
    required: true,
  },
  staff: {
    type: staffSchema,
    required: true,
  },
  slots:{
    type:[Object]
  },
  slotLeave:{
    type:Boolean,

  }
});

const StaffLeave = mongoose.model("StaffLeave", leaveSchema);

function validateStaffLeave(name) {
  const schema = Joi.object({
    leave_from: Joi.string().required(),
    leave_to: Joi.string().required(),
    staffID: Joi.objectId().required(),
    slots:Joi.array()
  });
  return schema.validate(name);
}

module.exports.leaveSchema = leaveSchema;
module.exports.StaffLeave = StaffLeave;
module.exports.validateStaffLeave = validateStaffLeave;
