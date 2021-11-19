const express = require("express");

const {
  UserRequest,
  validateUserRequest,
} = require("../models/UserRequestSchema");

const { Organization } = require("../models/organizationSchema");
const { Service } = require("../models/servicesSchema");

const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const requests = await UserRequest.find();
  res.send(requests);
});
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request not found with the given ID");
  const requests = await UserRequest.findById(req.params.id);
  if (!requests)
    return res.status(404).send("Request not found with the given ID");

  res.send(requests);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request not found with the given ID ");
  const requests = await UserRequest.findByIdAndRemove(req.params.id);
  if (!requests)
    return res.status(404).send("Request not found with the given ID");
  res.send(requests);
});

router.post("/", async (req, res) => {
  const { error } = validateUserRequest(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = await Organization.findById(req.body.OrganizationID);
  if (!organization)
    return res.status(400).send("Organization with the given ID doesn't exist");

  const service = await Service.findById(req.body.ServiceID);
  if (!service)
    return res.status(400).send("Service with the given ID doesn't exist");

  const request = new UserRequest({
    Organization: organization,
    Service: service,
    Schedule: req.body.Schedule,
    Time: req.body.Time,
    OnlyOnce: req.body.OnlyOnce,
    Address: req.body.Address,
    PhoneNo: req.body.PhoneNo,
  });

  try {
    const requestSaved = await request.save();
    res.send(requestSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateUserRequest(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = await Organization.findById(req.body.OrganizationID);
  if (!organization)
    return res.status(400).send("Organization with the given ID doesn't exist");

  const service = await Service.findById(req.body.ServiceID);
  if (!service)
    return res.status(400).send("Service with the given ID doesn't exist");

  const request = await UserRequest.findByIdAndUpdate(
    req.params.id,
    {
      Organization: organization,
      Service: service,
      Schedule: req.body.Schedule,
      OnlyOnce: req.body.OnlyOnce,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
    },
    {
      new: true,
    }
  );

  if (!request)
    return res.status(404).send("Request with the given ID was not found.");

  res.send(request);
});

module.exports = router;
