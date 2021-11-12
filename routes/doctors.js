const express = require("express");
const { Doctor, validateDoctor } = require("../models/doctorSchema");
const { Qualification } = require("../models/qualificationSchema");

const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const doctors = await Doctor.find().sort("fullName");
  res.send(doctors);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Doctor not found with the given ID");
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor)
    return res.status(404).send("Doctor not found with the given ID");

  res.send(doctor);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Doctor not found with the given ID ");

  const doctor = await Doctor.findByIdAndRemove(req.params.id);
  if (!doctor)
    return res.status(404).send("doctor not found with the given ID");
  res.send(doctor);
});

router.post("/", async (req, res) => {
  const { error } = validateDoctor(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const qualification = await Qualification.findById(req.body.qualificationID);
  if (!qualification)
    return res.status(400).send("The qualification doesn't exist");

  const doctor = new Doctor({
    fullName: req.body.fullName,

    dateOfBirth: req.body.dateOfBirth,
    qualification: {
      _id: qualification._id,
      name: qualification.name,
    },
    email: req.body.email,
    phone: req.body.phone,
  });

  try {
    const doctorSaved = await doctor.save();
    res.send(doctorSaved);
  } catch (ex) {
    res.send(ex);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateDoctor(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      qualification: req.body.qualification,
      email: req.body.email,
      phone: req.body.phone,
    },
    {
      new: true,
    }
  );

  if (!doctor)
    return res.status(404).send("Doctor with the given ID was not found.");

  res.send(doctor);
});

module.exports = router;
