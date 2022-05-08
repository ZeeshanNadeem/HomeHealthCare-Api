const express = require("express");
const {
  ServiceIndependent,
  validateServiceIndependent,
} = require("../models/IndependentServicesSchema");
const { Organization } = require("../models/organizationSchema");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", paginatedResults(ServiceIndependent),async (req, res) => {
  if (req.query.serviceID) {
    const services = await ServiceIndependent.find({
      _id: req.query.serviceID,
    });
    res.send(services);
  }
  else {
    // const services = await ServiceIndependent.find();
    res.json(res.paginatedResults);
    // res.send(services);
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

router.put("/:id", async (req, res) => {
  const { error } = validateServiceIndependent(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Service with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = await Organization.findById(
    req.body.OrganizationID
  );
  if (!organization)
    return res.status(400).send("Organization Type doesn't exist");

  const service = await ServiceIndependent.findByIdAndUpdate(
    req.params.id,
    {
      serviceName: req.body.serviceName,
      serviceOrganization: organization,
      servicePrice: req.body.servicePrice,
    },
    {
      new: true,
    }
  );

  if (!service)
    return res.status(404).send("Service with the given ID was not found.");

  res.send(service);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Service not found with the given ID ");
  const service = await ServiceIndependent.findByIdAndRemove(req.params.id);
  if (!service)
    return res.status(404).send("Service not found with the given ID");
  res.send(service);
});


function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const searchedValue = req.query.searchedString;
    const organization = req.query.organization;

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
      if (organization) {
        results.results = await model
          // .startsWith(searchedValue)
          .find({
            "serviceOrgranization._id": organization,
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
