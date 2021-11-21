const express = require("express");
const { Staff, validateStaff } = require("../models/staffSchema");
const { Qualification } = require("../models/qualificationSchema");

const { StaffType } = require("../models/StaffTypeSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", paginatedResults(Staff), async (req, res) => {
  // const staff = await Staff.find().sort("fullName");
  // res.send(staff);
  res.json(res.paginatedResults);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Staff member not found with the given ID");
  const staff = await Staff.findById(req.params.id);
  if (!staff)
    return res.status(404).send("Staff member not found with the given ID");

  res.send(staff);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Staff member found with the given ID ");
  const staff = await Staff.findByIdAndRemove(req.params.id);
  if (!staff)
    return res.status(404).send("Staff member found with the given ID");
  res.send(staff);
});

router.post("/", async (req, res) => {
  const { error } = validateStaff(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const qualification = await Qualification.findById(req.body.qualificationID);

  const staffType = await StaffType.findById(req.body.staffTypeID);
  if (!staffType) return res.status(400).send("Staff Type doesn't exist");

  if (!qualification)
    return res.status(400).send("The qualification doesn't exist");

  const staff = new Staff({
    fullName: req.body.fullName,
    dateOfBirth: req.body.dateOfBirth,
    staffType: {
      _id: staffType._id,
      name: staffType.name,
    },

    qualification: {
      _id: qualification._id,
      name: qualification.name,
    },
    availabilityForm: req.body.availabilityForm,
    availabilityTo: req.body.availabilityTo,
    email: req.body.email,
    phone: req.body.phone,
  });

  try {
    const staffSaved = await staff.save();
    res.send(staffSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateStaff(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res
      .status(400)
      .send("Staff member with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const qualification = await Qualification.findById(req.body.qualificationID);

  const staffType = await StaffType.findById(req.body.staffTypeID);

  if (!staffType) return res.status(400).send("Staff Type doesn't exist");

  if (!qualification)
    return res.status(400).send("The qualification doesn't exist");

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      staffType: staffType,

      qualification: qualification,
      availabilityFrom: req.body.availabilityFrom,
      availabilityTo: req.body.availabilityTo,

      email: req.body.email,
      phone: req.body.phone,
    },
    {
      new: true,
    }
  );

  if (!staff)
    return res
      .status(404)
      .send("Staff member with the given ID was not found.");

  res.send(staff);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const searchedValue = req.query.searchedString;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    try {
      if (searchedValue) {
        results.results = await model
          // .startsWith(searchedValue)
          .find({ serviceName: searchedValue })

          .limit(limit)
          .skip(startIndex)
          .exec();
      } else {
        results.results = await model
          .find()
          .limit(limit)
          .skip(startIndex)
          .exec();
      }

      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

module.exports = router;
