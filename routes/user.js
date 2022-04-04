const express = require("express");
const { User, validateUser } = require("../models/userSchema");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { StaffType } = require("../models/StaffTypeSchema");
const { Staff } = require("../models/staffSchema");
const { Qualification } = require("../models/qualificationSchema");
const { Organization } = require("../models/organizationSchema");
const { Service } = require("../models/servicesSchema");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/docx" ||
    file.mimetype === "application/doc"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fieldSize: 1024 * 1024 * 30 },
  fileFilter: fileFilter,
});

router.get("/", paginatedResults(User), async (req, res) => {
  if ((req.query.page && req.query.limit) || req.query.searchedAdmin) {
    res.json(res.paginatedResults);
  } else if (req.query.getOrganizationAdmins) {
    const users = await User.find({ isOrganizationAdmin: "pending" });
    res.send(users);
  } else if (req.query.GetStaff) {
    const users = await User.find({
      staffMember: { $exists: true },
    });
    res.send(users);
  } else if (req.query.findUser_) {
    const user = await User.findOne({ _id: req.query.findUser_ });
    if (!user) return res.status(404).send("User not found with the given ID");

    res.send(user);
  } else {
    const users = await User.find();
    res.send(users);
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.put("/:id", async (req, res) => {
  // const { error } = validateService(requestBody);

  if (req.query.findUser) {
    // const qualification = await Qualification.findById(
    //   req.body.qualificationID
    // );

    // const service = await Service.findById(req.body.serviceID);
    // if (!service) return res.status(400).send("Service Type doesn't exist");

    // if (!qualification)
    //   return res.status(400).send("The qualification doesn't exist");
    // const staffToUpdate = {
    //   fullName: req.body.fullName,

    //   staffSpeciality: {
    //     _id: service._id,
    //     name: service.serviceName,
    //   },
    //   qualification: qualification,
    //   availabilityFrom: req.body.availabilityFrom,
    //   availabilityTo: req.body.availabilityTo,
    //   availabileDayFrom: req.body.availabileDayFrom,
    //   availabileDayTo: req.body.availabileDayTo,
    //   Organization: req.body.Organization,

    //   // email: req.body.email,
    //   phone: req.body.phone,
    // };

    const staff = await Staff.findById(req.body.staffID);
    if (!staff) return res.status(400).send("Staff Member doesn't exist");

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName: req.body.fullName,
        staffMember: staff,
      },
      {
        new: true,
      }
    );
    res.send(user);
  } else {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res
        .status(400)
        .send("Organization with the given ID was not found. ");
    // if (error) {
    //   return res.status(400).send(error.details[0].message);
    // }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isOrganizationAdmin: req.body.isOrganizationAdmin,
      },
      {
        new: true,
      }
    );

    if (!user)
      return res
        .status(404)
        .send("Organization with the given ID was not found.");
    res.send(user);
  }
});

router.post("/", upload.single("CV"), async (req, res) => {

  if(req.query.indepedentServiceProvider){
      req.body.locations=JSON.parse(req.body.locations)
      const { error } = validateUser(req.body);
  
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  }
  else{
  const { error } = validateUser(req.body);
  

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already exists.");
  }

  user = new User(
    _.pick(req.body, [
      "fullName",
      // "lastName",
      // "username",
      // "dateOfBirth",
      "email",
      "password",
      "isOrganizationAdmin",
      "staffMember",
      "Organization",
      "Rating",
      "RatingAvgCount",
      "ResumePath",
    ])
  );

  const OrganizationID = req.body.OrganizationID;
  user.temp = req.body.password;

 

  if (OrganizationID) {
    const OrganizationObj = await Organization.findById(
      req.body.OrganizationID
    );

    user.Organization = OrganizationObj;
  }
  if (req.body.isAppAdmin) {
    user.isAppAdmin = req.body.isAppAdmin;
  }
  if (req.body.city) {
    user.city = req.body.city;
  }
  if (req.file) {
    user.ResumePath = req.file.path;

    user.ResumeName = req.file.originalname;
    user.fileType = req.file.mimetype;
  }
  if(req.body.locations){
    user.locations=req.body.locations

  }
  

  const staff = await Staff.findById(req.body.staffMemberID);
  if (staff) {
    user.staffMember = staff;
  }


  user.phone = req.body.phone;

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);
  if (req.body.isOrganizationAdmin) {
    user.isOrganizationAdmin = "pending";
  }

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(
      _.pick(user, [
        "_id",
        "fullName",
        "dateOfBirth",
        "email",
        "staffMember",
        "Organization",
      ])
    );
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("User not found with the given ID ");
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) return res.status(404).send("User not found with the given ID");
  res.send(user);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("User not found with the given ID");

  const user = await User.findOne({ "staffMember._id": req.params.id });
  if (!user) return res.status(404).send("User not found with the given ID");

  res.send(user);
});

router.patch("/", async (req, res) => {
  if (req.query.staffMemberID) {
    const requests = await User.find({
      "staffMember._id": req.query.staffMemberID,
    });

    for (let i = 0; i < requests.length; i++) {
      const staff = await User.findByIdAndUpdate(
        requests[i]._id,
        {
          $set: {
            "staffMember.Rating": req.body.Rating,
            "staffMember.RatingAvgCount": req.body.RatingAvgCount,
          },
        },
        {
          new: true,
        }
      );

      if (!staff)
        return res
          .status(404)
          .send("Staff Member with the given ID was not found.");

      res.send(staff);
    }
  } else if (req.query.EditUser) {
    const userGot = await User.findByIdAndUpdate(
      req.body.staffMemberID,
      {
        $set: {
          staffMember: req.body.staffMemberObj,
        },
      },
      {
        new: true,
      }
    );

    if (!userGot)
      return res
        .status(404)
        .send("Staff Member with the given ID was not found.");

    res.send(userGot);
  }
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const searchedAdmin = req.query.searchedAdmin;

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
    // console.log("searched value :::", searchedValue);
    // const str = "Saturday night plans";
    // const res = str.startsWith("Sat");
    // let filterdMovies = movies.filter((m) =>
    //   m.title.toLowerCase().startsWith(query.toLowerCase())
    // );
    try {
      if (searchedAdmin) {
        results.results = await model
          // .startsWith(searchedValue)
          .find({ fullName: searchedAdmin, isOrganizationAdmin: "pending" })

          .limit(limit)
          .skip(startIndex)
          .exec();
      } else {
        results.results = await model
          .find({ isOrganizationAdmin: "pending" })
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
