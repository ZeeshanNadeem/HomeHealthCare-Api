const express = require("express");

const { Organization } = require("../models/organizationSchema");
const router = express.Router();
const mongoose = require("mongoose");
const { Service } = require("../models/servicesSchema");
const {
  StaffDuties,
  validateStaffDuty,
} = require("../models/staffDutiesSchema");
// const { Staff } = require("../models/staffSchema");

router.get("/", async (req, res) => {
  if (req.query.day) {
    const staffDuties = await StaffDuties.find({ day: req.query.day });
    res.send(staffDuties);
  }
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
  console.log(req.body);
  const { error } = validateStaffDuty(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffMember = await Staff.findById(req.body.staffMemberId);
  if (!staffMember)
    return res
      .status(404)
      .send("The Staff member doesn't exist not found with the given ID");

  const organization = await Organization.findById(
    req.body.serviceOrganization
  );
  if (!organization)
    return res.status(404).send("Organzation not found with the given ID");
  console.log("Organization :", organization);
  const service = await Service.findById(req.body.serviceID);
  if (!service)
    return res.status(404).send("Service not found with the given ID");

  const staffDuty = new StaffDuties({
    staffMemberAssigned: staffMember,
    service: service,
    serviceOrganization: organization,
    Day: req.body.Day,
    From: req.body.From,
    To: req.body.To,
  });

  try {
    const staffDutyGot = await staffDuty.save();
    res.send(staffDutyGot);
  } catch (ex) {
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
  const staffMember = await Staff.findById(req.body.staffMemberId);
  if (!staffMember)
    return res
      .status(404)
      .send("Staff Member doesn't exist not found with the given ID");

  const organization = await Organization.findById(
    req.body.serviceOrgranization
  );
  if (!organization)
    return res.status(404).send("Organzation not found with the given ID");

  const service = await Service.findById(req.body.serviceID);
  if (!service)
    return res.status(404).send("Service not found with the given ID");

  const staffDuty = await StaffDuties.findByIdAndUpdate(
    req.params.id,
    {
      staffMemberAssigned: staffMember,
      service: service,
      serviceOrganization: organization,
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
