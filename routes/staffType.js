const express = require("express");
const { StaffType, validateStaffType } = require("../models/StaffTypeSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const staffType = await StaffType.find();

  res.send(staffType);
});

router.post("/", async (req, res) => {
  const { error } = validateStaffType(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffType = new StaffType({
    name: req.body.name,
  });

  try {
    const StaffTypeSaved = await staffType.save();
    res.send(StaffTypeSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

module.exports = router;
