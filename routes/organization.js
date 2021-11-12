const express = require("express");
const {
  Organization,
  validateOrganization,
} = require("../models/organizationSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const organization = await Organization.find();

  res.send(organization);
});

router.post("/", async (req, res) => {
  const { error } = validateOrganization(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = new Organization({
    name: req.body.name,
  });

  try {
    const organizationSaved = await organization.save();
    res.send(organizationSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

module.exports = router;
