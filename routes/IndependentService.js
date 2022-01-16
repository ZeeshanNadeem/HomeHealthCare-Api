const express = require("express");
const {
  ServiceIndependent,
  validateServiceIndependent,
} = require("../models/IndependentServicesSchema");
const { Organization } = require("../models/organizationSchema");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", async (req, res) => {
  if (req.query.serviceID) {
    const services = await ServiceIndependent.find({
      _id: req.query.serviceID,
    });
    res.send(services);
  } else {
    const services = await ServiceIndependent.find();
    res.send(services);
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Doctor not found with the given ID");
  const service = await ServiceIndependent.findById(req.params.id);
  if (!service)
    return res.status(404).send("service not found with the given ID");

  res.send(service);
});

router.post("/", async (req, res) => {
  const { error } = validateServiceIndependent(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const orgGot = await Organization.findById(req.body.OrganizationID);
  if (!orgGot)
    return res.status(404).send("Organization doesn't exist with the given ID");

  const service = new ServiceIndependent({
    serviceName: req.body.serviceName,
    serviceOrganization: orgGot,
    servicePrice: req.body.servicePrice,
  });

  try {
    const serviceSaved = await service.save();
    res.send(serviceSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

module.exports = router;
