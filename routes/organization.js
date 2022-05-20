const express = require("express");
const {
  Organization,
  validateOrganization,
} = require("../models/organizationSchema");
const {
Service,
} = require("../models/servicesSchema");

const {
  User,
  } = require("../models/userSchema");
const router = express.Router();
const mongoose = require("mongoose");


const distance = (lat1, lat2,radius,lon1,lon2) => {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.

  // lon1 = (lon1 * Math.PI) / 180;
  //   lon2 = (lon2 * Math.PI) / 180;
  //   lat1 = (lat1 * Math.PI) / 180;
  //   lat2 = (lat2 * Math.PI) / 180;


  lon1 = (lon1 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  
 
   
   lon2 =  (lon2* Math.PI) / 180;
    
   lat2 = (lat2 * Math.PI) / 180;
  
    // Haversine formula
    
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
  
    let c = 2 * Math.asin(Math.sqrt(a));
  
    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;
  
    // calculate the result
    let radiusFound= c * r;
    
  
    if(parseInt(radiusFound)<= parseInt(radius)){
      return true;
    }
    else return false;
 



};


//returns all those organizations whose radius lies in
//patient's lat lng
const checkRadius=async (services,lat,lng)=>{
  let Organizations=[];
for(let service of services){
 
  const users=await User.find({"Organization._id":service.serviceOrgranization._id.toString()})
  if(users.length>0){
  for(let user of users){
    if(user.locations.length>0){
     for (let location of user.locations){
        const liesInRadius= distance(location.lat,Number(lat),Number(location.radius),location.lng,Number(lng))
         if(liesInRadius){ 
          
         const check= Organizations.some(o=>o._id.toString()===service.serviceOrgranization._id.toString()); 
         if(check) continue;
         else{Organizations.push(service.serviceOrgranization)
          console.log(Organizations)
        continue;}
          
        }
     }
    }
  }
}
 
}
return Organizations;
}

router.get("/", paginatedResults(Organization), async (req, res) => {
  // getting organizations on patient lat lng radius lie check and service Name
  if(req.query.getOrganziations){
      const services=await Service.find({serviceName:req.query.service});
     const organizations= await checkRadius(services,req.query.lat,req.query.lng);
     console.log("orgs:",organizations);
     res.send(organizations);
  }

 else if(req.query.getIndependentOrg){
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
