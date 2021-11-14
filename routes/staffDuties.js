const express = require("express");
const {
  StaffDuties,
  validateStaffDuty,
} = require("../models/staffDutiesSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const staffDuties = await StaffDuties.find();

  res.send(staffDuties);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Duty not found with the given ID");
  const staffDuty = await StaffDuties.findById(req.params.id);
  if (!staffDuty)
    return res.status(404).send("Duty not found with the given ID");

  res.send(staffDuty);
});

router.post("/", async (req, res) => {
  const { error } = validateStaffDuty(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffDuty = new StaffDuties({
    serviceID: req.body.serviceID,
    Day: req.body.Day,
    From: req.body.From,
    To: req.body.To,
  });

  try {
    const staffDutyGot = await staffDuty.save();
    res.send(staffDutyGot);
  } catch (ex) {
    console.log("catch exp");
    return res.status(400).send(ex.details[0].message);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateStaffDuty(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Duty not found with the given ID. ");

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffDuty = await StaffDuties.findByIdAndUpdate(
    req.params.id,
    {
      serviceID: req.body.serviceID,
      Day: req.body.Day,
      From: req.body.From,
      To: req.body.To,
    },
    {
      new: true,
    }
  );

  if (!staffDuty)
    return res.status(404).send("Duty with the given ID was not found.");

  res.send(staffDuty);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Duty not found with the given ID ");
  const staffDuty = await StaffDuties.findByIdAndRemove(req.params.id);
  if (!staffDuty)
    return res.status(404).send("Duty not found with the given ID");
  res.send(staffDuty);
});

module.exports = router;
