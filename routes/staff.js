const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/auth");
const { Staff, validateStaff } = require("../models/staffSchema");

const { User } = require("../models/userSchema");

const { Qualification } = require("../models/qualificationSchema");

const { StaffType } = require("../models/StaffTypeSchema");
const router = express.Router();
const mongoose = require("mongoose");
const { Organization } = require("../models/organizationSchema");
const { Service } = require("../models/servicesSchema");
const { ServiceIndependent } = require("../models/IndependentServicesSchema");


router.get("/", paginatedResults(Staff), async (req, res) => {
  // const staff = await Staff.find().sort("fullName");
  // res.send(staff);

  if (req.query.findStaffOnOrg) {
    const staff = await Staff.find({
      "staffSpeciality._id": req.query.service,
      "Organization._id": req.query.organization,
    });
    res.send(staff);
  } else if (req.query.day && req.query.service && !req.query.allStaff) {
    // if (req.query.day.toUpperCase() === "SUNDAY") {
    //   res.send("Sunday's service not available");
    // }

    const staff = await Staff.find({
      "staffSpeciality._id": req.query.service,
      "Organization._id": req.query.organization,
      city: req.query.city,
    }).and([{ availableDays: { name: req.query.day, value: true } }]);

    // db.inventory.find({ instock: { warehouse: "A", qty: 5 } });
    res.send(staff);
  } else if (req.query.allStaff) {
    const staff = await Staff.find({
      "staffSpeciality._id": req.query.service,
      "Organization._id": req.query.organization,
      city: req.query.city,
    });

    res.send(staff);
  } else {
    res.json(res.paginatedResults);
  }
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

  if (!req.query.dontCheck) {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send("User already exists.");
    }
  }

  const qualification = await Qualification.findById(req.body.qualificationID);

  if (!qualification)
    return res.status(400).send("The qualification doesn't exist");

  if (req.query.signUpOrg) {
    const service = await ServiceIndependent.findById(req.body.serviceID);
    // const user =await User.findById(req.body.userID);
    // if (!user) return res.status(400).send("user ID not found")
    if (!service) return res.status(400).send("Independent service not found");

    const staff = new Staff({
      fullName: req.body.fullName,
      email: req.body.email,
      // dateOfBirth: req.body.dateOfBirth,
      // staffSpeciality: {
      //   _id: service._id,
      //   name: service.serviceName,
      //   servicePrice: service.servicePrice,
      // },
      staffSpeciality: {
        _id: service._id,
        name: service.serviceName,
        servicePrice: service.servicePrice,
      },
      Organization: req.body.Organization,
      qualification: {
        _id: qualification._id,
        name: qualification.name,
      },
      city: req.body.city,

      // availabilityFrom: req.body.availabilityFrom,
      // availabilityTo: req.body.availabilityTo,

      availableTime: req.body.availableTime,
      availableDays: req.body.availableDays,

      // availabileDayFrom: req.body.availabileDayFrom,
      // availabileDayTo: req.body.availabileDayTo,
      // email: req.body.email,
      phone: req.body.phone,

      Rating: false,
      RatingAvgCount: req.body.RatingAvgCount,
      // user:user
    });

    // if (req.query.approvel) {
    //   stafff.approvel = req.query.approvel;
    // }
    try {
      if (req.body.servicePrice) staff.service = req.body.servicePrice;

      const staffSaved = await staff.save();
      res.send(staffSaved);
    } catch (ex) {
      console.log("Exxx::", ex);
      return res.status(400).send(ex.details[0].message);
    }
  } else {
    const service = await Service.findById(req.body.serviceID);
    if (!service) return res.status(400).send("Service Type doesn't exist");
    console.log("service::", service);
    const staff = new Staff({
      fullName: req.body.fullName,
      email: req.body.email,
      // dateOfBirth: req.body.dateOfBirth,
      staffSpeciality: {
        _id: service._id,
        name: service.serviceName,
        servicePrice: service.servicePrice,
      },
      Organization: req.body.Organization,
      qualification: {
        _id: qualification._id,
        name: qualification.name,
      },
      city: req.body.city,
      // availabilityFrom: req.body.availabilityFrom,
      // availabilityTo: req.body.availabilityTo,

      availableTime: req.body.availableTime,
      availableDays: req.body.availableDays,

      // availabileDayFrom: req.body.availabileDayFrom,
      // availabileDayTo: req.body.availabileDayTo,
      // email: req.body.email,
      phone: req.body.phone,

      Rating: false,
      RatingAvgCount: req.body.RatingAvgCount,
      lat: req.body.lat,
      lng: req.body.lng,
    });

    // if (req.query.approvel) {
    //   stafff.approvel = req.query.approvel;
    // }

    try {
      if (req.body.servicePrice) staff.service = req.body.servicePrice;

      const staffSaved = await staff.save();
      res.send(staffSaved);
    } catch (ex) {
      console.log("Exx=>:", ex);
      return res.status(400).send(ex.details[0].message);
    }
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

  const service = await Service.findById(req.body.serviceID);
  if (!service) return res.status(400).send("Service Type doesn't exist");

  if (!qualification)
    return res.status(400).send("The qualification doesn't exist");

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      staffSpeciality: {
        _id: service._id,
        name: service.serviceName,
        servicePrice: service.servicePrice,
      },
      qualification: qualification,

      // availabilityFrom: req.body.availabilityFrom,
      // availabilityTo: req.body.availabilityTo,

      availableTime: req.body.availableTime,
      availableDays: req.body.availableDays,

      // availabileDayFrom: req.body.availabileDayFrom,
      // availabileDayTo: req.body.availabileDayTo,
      Organization: req.body.Organization,

      // email: req.body.email,
      phone: req.body.phone,
      Rating: req.body.Rating,
      RatingAvgCount: req.body.RatingAvgCount,
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

router.patch("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res
      .status(400)
      .send("Staff member with the given ID was not found. ");

  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
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
      if (req.query.organizationID) {
        results.results = await model
          // .startsWith(searchedValue)
          .find({
            "Organization._id": req.query.organizationID,
          })

          .limit(limit)
          .skip(startIndex)
          .exec();
      } else if (searchedValue) {
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
