const express = require("express");

const { Service } = require("../models/servicesSchema");
const {
  userRequests,
  validateUserRequest,
} = require("../models/userRequestsSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const requests = await userRequests.find().sort("fullName");
  res.send(requests);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request not found with the given ID");
  const requests = await userRequests.findById(req.params.id);
  if (!requests)
    return res.status(404).send("Request not found with the given ID");

  res.send(requests);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request not found with the given ID ");
  const requests = await userRequests.findByIdAndRemove(req.params.id);
  if (!requests)
    return res.status(404).send("Request not found with the given ID");
  res.send(requests);
});

router.post("/", async (req, res) => {
  const { error } = validateUserRequest(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const service = await Service.findById(req.body.requestID);
  if (!service)
    return res.status(400).send("Invalid Request! The service doesn't exist");
  const requests = new userRequests({
    fullName: req.body.fullName,
    requestType: { _id: service._id, name: service.name },
    phone: req.body.phone,
    address: req.body.address,
  });

  try {
    const requestSaved = await requests.save();
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
  const service = Service.findById(req.body.requestID);
  if (!service)
    return res.status(400).send("Invalid Request! The service doesn't exist");
  const request = await userRequests.findByIdAndUpdate(
    req.params.id,
    {
      fullName: req.body.fullName,
      requestType: req.body.requestID,
      phone: req.body.phone,
      address: req.body.address,
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
