const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");

const { Staff } = require("../models/staffSchema");
const { StaffLeave, validateStaffLeave } = require("../models/leaveSchema");

router.get("/", async (req, res) => {
  const staffLeaves = await StaffLeave.find();
  res.send(staffLeaves);
});

router.post("/", async (req, res) => {
  const { error } = validateStaffLeave(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staff = await Staff.findById(req.body.staffID);

  if (!staff)
    return res.status(404).send("Staff doesn't exist with the given ID");

  const staffLeaveObj = new StaffLeave({
    leaveFrom: req.body.leave_from,
    leaveTo: req.body.leave_to,
    staff: staff,
  });

  try {
    const staffLeaveGot = await staffLeaveObj.save();
    res.send(staffLeaveGot);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

module.exports = router;
