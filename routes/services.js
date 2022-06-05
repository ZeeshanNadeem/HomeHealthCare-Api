const express = require("express");
const { Service, validateService } = require("../models/servicesSchema");
const { Organization } = require("../models/organizationSchema");
const {
  ServiceIndependent,
  independentServicesSchema,
} = require("../models/IndependentServicesSchema");
const { User } = require("../models/userSchema");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");

router.get("/", paginatedResults(Service), async (req, res) => {
  // const services = await Service.find().sort("name");

  // res.send(services);
  if (req.query.findServiceByUser) {
    const services = await Service.find({ "user._id": req.query.userID });
    res.send(services);
  } 
 else if(req.query.UniqueService){
  const services = await Service.distinct("serviceName");
  res.send(services);
 } 
 //Getting Service Chosen Cost on Repeated Service
 else if(req.query.getServiceCost){
   let services=null;
     services=await Service.find({serviceName:req.query.service,"serviceOrgranization._id":req.query.organizationID})
    if(!services){
      services=await ServiceIndependent.find({serviceName:req.query.service,"serviceOrgranization._id":req.query.organizationID})
    }
    res.send(services[0].servicePrice)
 }
  else if (req.query.IndependentServiceID) {
    const services = await Service.find({
      "IndependentService._id": req.query.IndependentServiceID,
    });
    res.send(services);
  } else res.json(res.paginatedResults);
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

  const organization = await Organization.findById(
    req.body.serviceOrgranization
  );

  if (!organization)
    return res.status(400).send("Organization Type doesn't exist");

  if (req.body.userID) {
    const serviceGot = await ServiceIndependent.findById(req.body.serviceID);
    if (!serviceGot)
      return res.status(400).send("Independent service doesn't exist");

      const services=req.body.services;
      let res_=[];
      for(let s of services){
    const service = new Service({
      serviceName: s.serviceName,
      IndependentService: serviceGot,
      serviceOrgranization: organization,
      servicePrice: s.servicePrice,
    });

    const user = await User.findById(req.body.userID);
    service.user = user;

    try {
      const serviceSaved = await service.save();
      res_.push(serviceSaved)
      // res.send(serviceSaved);
    } catch (ex) {
      return res.status(400).send(ex.details[0].message);
    }
  }
  res.send(res_)
  } else {
    try {
      const service = new Service({
        serviceName: req.body.serviceName,
        serviceOrgranization: organization,
        servicePrice: req.body.servicePrice,
      });
      const serviceSaved = await service.save();
      res.send(serviceSaved);
    } catch (ex) {
      console.log("exxx:", ex);
      return res.status(400).send(ex.details[0].message);
    }
  }
});

router.patch("/", async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.body.serviceID,
    {
      $set: {
        "user.isOrganizationAdmin": "Approved Independent Member",
      },
    },
    {
      new: true,
    }
  );

  if (!service)
    return res.status(404).send("service with the given ID was not found.");

  res.send(service);
});

router.put("/:id", async (req, res) => {
  const { error } = validateService(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Service with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = await Organization.findById(
    req.body.serviceOrgranization
  );
  if (!organization)
    return res.status(400).send("Organization Type doesn't exist");

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    {
      serviceName: req.body.serviceName,
      serviceOrgranization: organization,
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
