const express = require("express");
const { User, validateUser } = require("../models/userSchema");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { StaffType } = require("../models/StaffTypeSchema");
const { Staff } = require("../models/staffSchema");
const { Qualification } = require("../models/qualificationSchema");

router.get("/", async (req, res) => {
  if (req.query.getOrganizationAdmins) {
    const users = await User.find({ isOrganizationAdmin: "pending" });
    res.send(users);
  }
  const users = await User.find();
  res.send(users);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.put("/:id", async (req, res) => {
  // const { error } = validateService(requestBody);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res
      .status(400)
      .send("Organization with the given ID was not found. ");
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isOrganizationAdmin: "Approved Admin",
    },
    {
      new: true,
    }
  );

  if (!user)
    return res
      .status(404)
      .send("Organization with the given ID was not found.");

  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already exists.");
  }

  user = new User(
    _.pick(req.body, ["fullName", "dateOfBirth", "email", "password"])
  );

  // const staffType = await StaffType.findById(req.body.staffTypeID);
  // if (!staffType) return res.status(400).send("Staff Type doesn't exist");

  // const qualification = await Qualification.findById(req.body.qualificationID);

  // if (!qualification)
  //   return res.status(400).send("The qualification doesn't exist");

  const staff = await Staff.findById(req.body.staffMemberID);
  if (staff) {
    user.staffMember = staff;
  }

  // user.staffType = { _id: staffType._id, name: staffType.name };
  // user.qualification = { _id: qualification._id, name: qualification.name };

  // user.availabilityFrom = req.body.availabilityFrom;
  // user.availabilityTo = req.body.availabilityTo;
  // user.availabileDayFrom = req.body.availabileDayFrom;
  // user.availabileDayTo = req.body.availabileDayTo;

  user.phone = req.body.phone;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  if (req.body.isOrganizationAdmin) {
    user.isOrganizationAdmin = "pending";
  }
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(
      _.pick(user, ["_id", "fullName", "dateOfBirth", "email", "staffMember"])
    );
});

module.exports = router;
