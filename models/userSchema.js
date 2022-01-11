const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { staffSchema } = require("./staffSchema");
const { qualificationSchema } = require("./qualificationSchema");
const { organizationSchema } = require("./organizationSchema");
const { staffTypeSchema } = require("./StaffTypeSchema");
const config = require("config");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  dateOfBirth: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    // unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAppAdmin: {
    type: Boolean,
  },
  isOrganizationAdmin: {
    type: String,
  },
  staffMember: {
    type: staffSchema,
  },
  Organization: {
    type: organizationSchema,
  },
  Rating: {
    type: Number,
  },
  RatingAvgCount: {
    type: Number,
  },
  ResumePath: {
    type: String,
  },
  ResumeName: {
    type: String,
  },
  fileType: {
    type: String,
  },
  qualification: {
    type: String,
  },
  services: {
    Type: String,
  },

  // staffType: {
  //   type: staffTypeSchema,
  // },
  // qualification: {
  //   type: qualificationSchema,
  // },
  // staffType: {
  //   type: Object,
  // },
  // qualification: {
  //   type: Object,
  // },
  // availabilityFrom: {
  //   type: String,
  // },
  // availabilityTo: {
  //   type: String,
  // },
  // availabileDayFrom: {
  //   type: String,
  // },
  // availabileDayTo: {
  //   type: String,
  // },
  // phone: {
  //   type: Number,
  // },

  // AgreePolicy: {
  //   type: Boolean,
  //   required: true,
  // },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      isAppAdmin: this.isAppAdmin,
      isOrganizationAdmin: this.isOrganizationAdmin,
      staffMember: this.staffMember,
      Organization: this.Organization,
      Rating: this.Rating,
      RatingAvgCount: this.RatingAvgCount,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required(),
    dateOfBirth: Joi.string(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    isOrganizationAdmin: Joi.boolean(),
    staffMemberID: Joi.objectId(),
    uploads: Joi.string(),
    ResumePath: Joi.string(),
    ResumeName: Joi.string(),
    fileType: Joi.string(),
    OrganizationID: Joi.string(),
    Rating: Joi.number(),
    RatingAvgCount: Joi.number(),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.userSchema = userSchema;
