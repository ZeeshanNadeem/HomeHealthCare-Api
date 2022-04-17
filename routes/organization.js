const express = require("express");
const {
  Organization,
  validateOrganization,
} = require("../models/organizationSchema");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", paginatedResults(Organization), async (req, res) => {
  // const organization = await Organization.find();

  if(req.query.getIndependentOrg){
        const organizations=await Organization.find();
        let temp=organizations.filter(x=>x.name.toUpperCase().includes("INDEPENDENT"));
        res.send(temp);
  }
  else
  res.json(res.paginatedResults);
});

router.post("/", async (req, res) => {
  const { error } = validateOrganization(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = new Organization({
    name: req.body.name,
  });

  try {
    const organizationSaved = await organization.save();
    res.send(organizationSaved);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Organization not found with the given ID ");
  const organization = await Organization.findByIdAndRemove(req.params.id);
  if (!organization)
    return res.status(404).send("Organization not found with the given ID");
  res.send(organization);
});

router.put("/:id", async (req, res) => {
  const { error } = validateOrganization(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res
      .status(400)
      .send("Organization with the given ID was not found. ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const organization = await Organization.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    {
      new: true,
    }
  );

  if (!organization)
    return res
      .status(404)
      .send("Organizaation with the given ID was not found.");

  res.send(organization);
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
          });

        // .limit(limit)
        // .skip(startIndex)
        // .exec();
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
