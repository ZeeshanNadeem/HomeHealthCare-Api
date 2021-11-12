const express = require("express");
const { Service, validateService } = require("../models/servicesSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", paginatedResults(Service), async (req, res) => {
  // const services = await Service.find().sort("name");

  // res.send(services);
  res.json(res.paginatedResults);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Service not found with the given ID");
  const service = await Service.findById(req.params.id);
  if (!service)
    return res.status(404).send("Service not found with the given ID");

  res.send(service);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Service not found with the given ID ");
  const service = await Service.findByIdAndRemove(req.params.id);
  if (!service)
    return res.status(404).send("Service not found with the given ID");
  res.send(service);
});

router.post("/", async (req, res) => {
  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const service = new Service({
    serviceName: req.body.serviceName,
    serviceOrgranization: req.body.serviceOrgranization,
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
  const { error } = validateService(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Service with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    {
      serviceName: req.body.serviceName,
      serviceOrgranization: req.body.serviceOrgranization,
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
    // console.log("searched value :::", searchedValue);
    // const str = "Saturday night plans";
    // const res = str.startsWith("Sat");
    // let filterdMovies = movies.filter((m) =>
    //   m.title.toLowerCase().startsWith(query.toLowerCase())
    // );
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
