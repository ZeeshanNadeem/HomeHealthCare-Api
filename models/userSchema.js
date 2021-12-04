const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { staffSchema } = require("./staffSchema");
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
    required: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
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
  // staff: {
  //   type: staffSchema,
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
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required(),
    dateOfBirth: Joi.string().required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    isOrganizationAdmin: Joi.boolean(),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
