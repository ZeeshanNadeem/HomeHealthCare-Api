const express = require("express");
const { Staff } = require("../models/staffSchema");
const {
  UserRequest,
  validateUserRequest,
} = require("../models/UserRequestSchema");

const { Organization } = require("../models/organizationSchema");
const { Service } = require("../models/servicesSchema");
const { ServiceIndependent } = require("../models/IndependentServicesSchema");
const { User } = require("../models/userSchema");

const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  if (req.query.userID) {
    const requests = await UserRequest.find({
      "user._id": req.query.userID,
      

    });
    res.send(requests);
} else if (req.query.staffMemberId && !req.query.showMyDuties) {
    const requests = await UserRequest.find({
      "staffMemberAssigned._id": req.query.staffMemberId,
      completed:{$exists: false}
      // reschedule:{$ne:true}

    });
    res.send(requests);
  }
  else if (req.query.showMyDuties) {
    const requests = await UserRequest.find({
      "staffMemberAssigned._id": req.query.staffMemberId,
     
      // reschedule:{$ne:true}

    });
    res.send(requests);
  }
  
  
  else if (req.query.vacPlan) {
    const requests = await UserRequest.find({
      "user._id": req.query.userID,
      VaccinationPlan: true,
      // reschedule:{$ne:true}

    });
    res.send(requests);
  } else {
    const requests = await UserRequest.find({
      
      completed:{$exists: false},
      reschedule:{$ne:true}


    });
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
      VaccinationPlan: req.body.vaccination,
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
      lat:req.body.lat,
      lng:req.body.lng,
      markers:req.body.markers,
      NotificationViewed: false,
      
    });

    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
      return res.status(400).send(ex.details[0].message);
    }
  } else if (req.query.assignDuty) {
    console.log("req.body:",req.body)
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
      VaccinationPlan: req.body.vaccination,
      Schedule: req.body.Schedule,
      Service: req.body.Service,
      ServiceNeededTime: req.body.ServiceNeededTime,
      // ServiceNeededTo: req.body.ServiceNeededTo,
      // Recursive: req.body.Recursive,
      City: req.body.City,
      Email: req.body.Email,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
      markers:req.body.markers,
      rated: false,
      NotificationViewed: false,
      lat:req.body.lat,
      lng:req.body.lng
  
    });

    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
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

    let service = null;
    service = await Service.findById(req.body.ServiceID);
    // if (!service)
    //   return res.status(400).send("Service with the given ID doesn't exist");

    if (!service) {
      service = await ServiceIndependent.findById(req.body.ServiceID);
      if (!service)
        return res
          .status(400)
          .send("Independent Service  or service doesn't exist");
    }

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
      VaccinationPlan: req.body.vaccination,
      Service: service,
      Schedule: req.body.Schedule,
      ServiceNeededTime: req.body.ServiceNeededTime,
      // ServiceNeededTo: ServiceNeededTo_,
      // Recursive: req.body.Recursive,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,

      Email: req.body.email,
      City: req.body.city,
      rated: false,
      NotificationViewed: false,
      lat:req.body.lat,
      lng:req.body.lng
    
     
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
  // const { error } = validateUserRequest(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Request with the given ID was not found. ");
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }

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
      fullName: req.body.fullName,
      Email: req.body.Email,
 
      staffMemberAssigned: req.body.staffMemberAssigned,
      VaccinationPlan: req.body.vaccination,
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
      lat:req.body.lat,
      lng:req.body.lng,
      markers:req.body.markers,
      NotificationViewed: false,
      reschedule:false
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
  } else if (req.query.notification) {
    const userRequest = await UserRequest.findByIdAndUpdate(
      req.query.userReqID,
      {
        $set: {
          NotificationViewed: true,
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
  } else if (req.query.getPatientAppointmentsID) {
    const appointments = await UserRequest.find({
      "user._id": req.query.getPatientAppointmentsID,
    });
    res.send(appointments);
  }
 else if(req.query.rescheduleAppointment){

    const request = await UserRequest.findByIdAndUpdate(
      req.query.id,
      {
        reschedule:req.body.status
      },
      {
        new: true,
      }
    );
  
    if (!request)
      return res.status(404).send("Request with the given ID was not found.");
  
    res.send(request);
  }

  else if(req.query.rescheduleFalse){
    const requests = await UserRequest.updateMany(
     {},{reschedule:req.body.status}
    );
  
    if (!requests)
      return res.status(404).send("Request with the given ID was not found.");

    res.send(requests);
  
  }
  else if(req.query.serviceCompleted){
    const request = await UserRequest.findByIdAndUpdate(
      req.query.id,
      {
        completed:req.body.completeStatus
      },
      {
        new: true,
      }
    );
  
    if (!request)
      return res.status(404).send("Request with the given ID was not found.");
  
    res.send(request);
  }
});
module.exports = router;
