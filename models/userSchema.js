const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { staffSchema } = require("./staffSchema");
const { qualificationSchema } = require("./qualificationSchema");
const { organizationSchema } = require("./organizationSchema");
const { staffTypeSchema } = require("./StaffTypeSchema");
const config = require("config");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  dateOfBirth: {
    type: String,
  },
  temp: {
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
  city: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
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
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      isAppAdmin: this.isAppAdmin,
      isOrganizationAdmin: this.isOrganizationAdmin,
      staffMember: this.staffMember,
      Organization: this.Organization,
      Rating: this.Rating,
      RatingAvgCount: this.RatingAvgCount,
      city: this.city,
      lat: this.lat,
      lng: this.lng,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string().min(5).max(50).required(),
    lastName: Joi.string().min(5).max(50).required(),
    username: Joi.string().min(5).max(50).required(),
    dateOfBirth: Joi.string(),
    city: Joi.string(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    isAppAdmin: Joi.boolean(),
    isOrganizationAdmin: Joi.boolean(),
    staffMemberID: Joi.objectId(),
    uploads: Joi.string(),
    ResumePath: Joi.string(),
    ResumeName: Joi.string(),
    fileType: Joi.string(),
    OrganizationID: Joi.string(),
    Rating: Joi.number(),
    RatingAvgCount: Joi.number(),
    lat: Joi.number(),
    lng: Joi.number(),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.userSchema = userSchema;
