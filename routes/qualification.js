const express = require("express");
const {
  Qualification,
  validateQualification,
} = require("../models/qualificationSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const qualifications = await Qualification.find();

  res.send(qualifications);
});

router.post("/", async (req, res) => {
  const { error } = validateQualification(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const qualification = new Qualification({
    name: req.body.name,
  });

  try {
    const qualificationSaved = await qualification.save();
    res.send(qualificationSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

module.exports = router;
