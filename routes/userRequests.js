const express = require("express");
const { Staff } = require("../models/staffSchema");
const {
  UserRequest,
  validateUserRequest,
} = require("../models/UserRequestSchema");

const { Organization } = require("../models/organizationSchema");
const { Service } = require("../models/servicesSchema");
const { User } = require("../models/userSchema");

const router = express.Router();
const mongoose = require("mongoose");
const { request } = require("express");

router.get("/", async (req, res) => {
  if (req.query.userID) {
    const requests = await UserRequest.find({
      "user._id": req.query.userID,
    });
    res.send(requests);
  } else if (req.query.staffMemberId) {
    const requests = await UserRequest.find({
      "staffMemberAssigned._id": req.query.staffMemberId,
    });
    res.send(requests);
  } else {
    const requests = await UserRequest.find();
    res.send(requests);
  }
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
  if (req.query.deleteDuty && req.query.DeleteID) {
    const requests = await UserRequest.findByIdAndRemove(DeleteID);
    if (!requests)
      return res.status(404).send("Request not found with the given ID");
    res.send(requests);
  } else {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).send("Request not found with the given ID ");
    const requests = await UserRequest.findByIdAndRemove(req.params.id);
    if (!requests)
      return res.status(404).send("Request not found with the given ID");
    res.send(requests);
  }
});

router.post("/", async (req, res) => {
  if (req.query.postObj) {
    const request = new UserRequest({
      fullName: req.body.fullName,
      Email: req.body.Email,
      user: req.body.user,
      staffMemberAssigned: req.body.staffMemberAssigned,
      Organization: req.body.Organization,
      Schedule: req.body.Schedule,
      Service: req.body.Service,
      ServiceNeededTime: req.body.ServiceNeededTime,
      // ServiceNeededTo: req.body.ServiceNeededTo,
      City: req.body.City,
      // Recursive: req.body.Recursive,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
      rated: req.body.rated,
    });

    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
      console.log("Ex::", ex);
      return res.status(400).send(ex.details[0].message);
    }
  } else if (req.query.assignDuty) {
    const staffMember = await Staff.findById(req.body.staffMemberID);

    const user = await User.findById(req.body.userID);
    if (!user)
      return res.status(404).send("The User doesn't exist with the given ID");

    if (!staffMember)
      return res
        .status(404)
        .send("The Staff member doesn't exist  with the given ID");
    const request = new UserRequest({
      fullName: req.body.fullName,
      user: user,
      staffMemberAssigned: staffMember,
      Organization: req.body.Organization,
      Schedule: req.body.Schedule,
      Service: req.body.Service,
      ServiceNeededTime: req.body.ServiceNeededTime,
      // ServiceNeededTo: req.body.ServiceNeededTo,
      // Recursive: req.body.Recursive,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
      rated: false,
    });

    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
      console.log("EX:", ex);
      return res.status(400).send(ex.details[0].message);
    }
  } else {
    const { error } = validateUserRequest(req.body);

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const staffMember = await Staff.findById(req.body.staffMemberID);
    if (!staffMember)
      return res
        .status(404)
        .send("The Staff member doesn't exist not found with the given ID");

    const organization = await Organization.findById(req.body.OrganizationID);
    if (!organization)
      return res
        .status(400)
        .send("Organization with the given ID doesn't exist");

    const service = await Service.findById(req.body.ServiceID);
    if (!service)
      return res.status(400).send("Service with the given ID doesn't exist");

    const user = await User.findById(req.body.userID);
    if (!user)
      return res.status(404).send("The User doesn't exist with the given ID");

    // const myArray = req.body.ServiceNeededFrom.split(":");
    // const sum = parseInt(myArray[0]) + 3;
    // const ServiceNeededTo_ = sum + ":00";

    const request = new UserRequest({
      fullName: req.body.fullName,
      user: user,
      staffMemberAssigned: staffMember,
      Organization: organization,
      Service: service,
      Schedule: req.body.Schedule,
      ServiceNeededTime: req.body.ServiceNeededTime,
      // ServiceNeededTo: ServiceNeededTo_,
      // Recursive: req.body.Recursive,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
      rated: false,
      Email: req.body.email,
      City: req.body.city,
    });

    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
      return res.status(400).send(ex.details[0].message);
    }
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateUserRequest(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffMember = await Staff.findById(req.body.staffMemberID);
  if (!staffMember)
    return res
      .status(404)
      .send("Staff Member doesn't exist not found with the given ID");

  const organization = await Organization.findById(req.body.OrganizationID);
  if (!organization)
    return res.status(400).send("Organization with the given ID doesn't exist");

  const service = await Service.findById(req.body.ServiceID);
  if (!service)
    return res.status(400).send("Service with the given ID doesn't exist");

  const request = await UserRequest.findByIdAndUpdate(
    req.params.id,
    {
      staffMemberAssigned: staffMember,
      Organization: organization,
      Service: service,
      Schedule: req.body.Schedule,
      ServiceNeededTime: req.body.ServiceNeededTime,
      // ServiceNeededTo: req.body.ServiceNeededTo,
      OnlyOnce: req.body.OnlyOnce,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
      rated: false,
      Email: req.body.email,
      City: req.body.city,
    },
    {
      new: true,
    }
  );

  if (!request)
    return res.status(404).send("Request with the given ID was not found.");

  res.send(request);
});

router.patch("/", async (req, res) => {
  if (req.query.staffMemberID) {
    const requests = await UserRequest.find({
      "staffMemberAssigned._id": req.query.staffMemberID,
    });

    for (let i = 0; i < requests.length; i++) {
      const userRequest = await UserRequest.findByIdAndUpdate(
        requests[i]._id,
        {
          $set: {
            "staffMemberAssigned.Rating": req.body.Rating,
            "staffMemberAssigned.RatingAvgCount": req.body.RatingAvgCount,
            rated: true,
          },
        },
        {
          new: true,
        }
      );

      if (!userRequest)
        return res
          .status(404)
          .send("User Request with the given ID was not found.");

      res.send(userRequest);
    }
  }
});
module.exports = router;
