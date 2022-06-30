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
const { StaffLeave } = require("../models/leaveSchema");

const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  if (req.query.userID) {
    const requests = await UserRequest.find({
      "user._id": req.query.userID,
      // canceled:{$exists:false}
    }).sort({ Schedule: 1 });
    res.send(requests);
  } else if (req.query.staffMemberId && !req.query.showMyDuties) {
    const requests = await UserRequest.find({
      "staffMemberAssigned._id": req.query.staffMemberId,
      completed: { $exists: false },
      canceled: { $exists: false },
      // reschedule:{$ne:true}
    });
    res.send(requests);
  } else if (req.query.showMyDuties) {
    const requests = await UserRequest.find({
      "staffMemberAssigned._id": req.query.staffMemberId,
      // canceled: { $exists: false },

      // reschedule:{$ne:true}
    });
    res.send(requests);
  } else if (req.query.vacPlan) {
    const requests = await UserRequest.find({
      "user._id": req.query.userID,
      VaccinationPlan: true,

      // reschedule:{$ne:true}
    });
    res.send(requests);
  } else {
    const requests = await UserRequest.find({
      completed: { $exists: false },
      reschedule: { $ne: true },
      canceled: { $exists: false },
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
      lat: req.body.lat,
      lng: req.body.lng,
      markers: req.body.markers,
      NotificationViewed: false,
    });

    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
      return res.status(400).send(ex.details[0].message);
    }
  } else if (req.query.assignDuty) {
    console.log("req.body:", req.body);
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
      markers: req.body.markers,
      rated: false,
      NotificationViewed: false,
      lat: req.body.lat,
      lng: req.body.lng,
    });

    if (req.body.canceled) {
      request.canceled = req.body.canceled;
    }
    try {
      const requestSaved = await request.save();
      res.send(requestSaved);
    } catch (ex) {
      return res.status(400).send(ex.details[0].message);
    }
  } else if (
    req.query.repeated &&
    req.query.servicePlan === "Daily" &&
    req.query.multiple
  ) {
    let staff = await Staff.find({
      staffSpeciality: { $elemMatch: { serviceName: req.query.service } },
      "Organization._id": req.query.organization,
    }).sort({ Rating: -1 });
    let meetingsScheduledCount = 0;
    let response = [];
    let serviceDate = null;
    for (let i = 0; i < req.body.repeatedDates.length; i++) {
      for (let s = 0; s < staff.length; s++) {
        if (
          parseInt(meetingsScheduledCount) ===
          parseInt(req.body.repeatedMeetingsNo)
        ) {
          break;
        }

        for (let i = 0; i < req.body.repeatedMeetingsNo; i++) {
          if (
            parseInt(meetingsScheduledCount) ===
            parseInt(req.body.repeatedMeetingsNo)
          ) {
            break;
          }

          serviceDate = new Date(req.body.repeatedDates[i].date);
          let day = new Date(serviceDate);
          let d = day.getDay();
          let weeklyCalculation = null;
          if (d === 0) {
            d = "SUN";
          } else if (d === 1) {
            d = "MON";
            weeklyCalculation = 2;
          } else if (d === 2) {
            d = "TUE";
            weeklyCalculation = 3;
          } else if (d === 3) {
            d = "WED";
            weeklyCalculation = 4;
          } else if (d === 4) {
            d = "THRU";
            weeklyCalculation = 5;
          } else if (d === 5) {
            d = "FRI";
            weeklyCalculation = 6;
          } else if (d === 6) {
            d = "SAT";
            weeklyCalculation = 7;
          }

          let checkDayAvailability = staff[s].availableDays.some(
            (staff) => staff.name === d && staff.value === true
          );
          if (!checkDayAvailability) continue;

          let staffContainsSlot = staff[s].availableTime.some(
            (staff) =>
              staff.time === req.body.ServiceNeededTime && staff.value === true
          );
          if (!staffContainsSlot) continue;

          const duties = await UserRequest.find({
            "staffMemberAssigned._id": staff[s]._id,
            Schedule: serviceDate,
            ServiceNeededTime: req.body.ServiceNeededTime,
          });

          if (duties && duties.length > 0) continue;

          const leaves = await StaffLeave.find({
            from: { $gte: new Date(serviceDate) },
            "staff._id": staff[s]._id,
          }).and([{ to: { $lte: new Date(serviceDate) } }]);

          if (leaves && leaves.length > 0) continue;

          const user = await User.findById(req.body.userID);
          if (!user)
            return res
              .status(404)
              .send("The User doesn't exist with the given ID");

          const org = await Organization.findById(req.body.OrganizationID);
          if (!org) return res.status(404).send("Organization doesn't exist");

          let service = null;
          service = await Service.find({
            serviceName: req.query.service,
            "serviceOrgranization._id": req.query.organization,
          });

          if (!service) {
            service = await ServiceIndependent.find({
              serviceName: req.query.service,
              "serviceOrgranization._id": req.query.organization,
            });
          }

          if (!service) res.status(404).send("service doesn't exist");
          // let day_ = FullDate1.getDate();
          // let month_ = FullDate1.getMonth() + 1;
          // const year_ = FullDate1.getFullYear();
          const request = new UserRequest({
            fullName: req.body.fullName,
            Email: req.body.email,
            user: user,
            staffMemberAssigned: staff[s],
            Organization: org,
            VaccinationPlan: req.body.vaccination,
            Schedule:
              serviceDate.getFullYear() +
              "-" +
              parseInt(serviceDate.getMonth() + 1) +
              "-" +
              serviceDate.getDate(),
            Service: service[0],
            ServiceNeededTime: req.body.ServiceNeededTime,
            Address: req.body.Address,
            PhoneNo: req.body.PhoneNo,
            rated: false,
          });

          try {
            const requestSaved = await request.save();
            meetingsScheduledCount++;
            response.push(requestSaved);
          } catch (ex) {
            return res.status(400).send(ex.details[0].message);
          }
          // if (req.query.servicePlan === "Daily") {
          //   serviceDate.setDate(serviceDate.getDate() + 1);
          // }
        }
      }
    }
    res.send(response);
  } else if (req.query.repeated && req.query.servicePlan === "Daily") {
    let staff = await Staff.find({
      staffSpeciality: { $elemMatch: { serviceName: req.query.service } },
      "Organization._id": req.query.organization,
    }).sort({ Rating: -1 });
    let meetingsScheduledCount = 0;
    let response = [];
    let serviceDate = null;
    for (let s = 0; s < staff.length; s++) {
      if (
        parseInt(meetingsScheduledCount) ===
        parseInt(req.body.repeatedMeetingsNo)
      ) {
        break;
      }

      for (let i = 0; i < req.body.repeatedMeetingsNo; i++) {
        if (
          parseInt(meetingsScheduledCount) ===
          parseInt(req.body.repeatedMeetingsNo)
        ) {
          break;
        }

        if (meetingsScheduledCount === 0)
          serviceDate = new Date(req.body.Schedule);
        let day = new Date(serviceDate);
        let d = day.getDay();
        let weeklyCalculation = null;
        if (d === 0) {
          d = "SUN";
        } else if (d === 1) {
          d = "MON";
          weeklyCalculation = 2;
        } else if (d === 2) {
          d = "TUE";
          weeklyCalculation = 3;
        } else if (d === 3) {
          d = "WED";
          weeklyCalculation = 4;
        } else if (d === 4) {
          d = "THRU";
          weeklyCalculation = 5;
        } else if (d === 5) {
          d = "FRI";
          weeklyCalculation = 6;
        } else if (d === 6) {
          d = "SAT";
          weeklyCalculation = 7;
        }

        let checkDayAvailability = staff[s].availableDays.some(
          (staff) => staff.name === d && staff.value === true
        );
        if (!checkDayAvailability) continue;

        let staffContainsSlot = staff[s].availableTime.some(
          (staff) =>
            staff.time === req.body.ServiceNeededTime && staff.value === true
        );
        if (!staffContainsSlot) continue;

        const duties = await UserRequest.find({
          "staffMemberAssigned._id": staff[s]._id,
          Schedule: serviceDate,
          ServiceNeededTime: req.body.ServiceNeededTime,
        });

        if (duties && duties.length > 0) continue;

        const leaves = await StaffLeave.find({
          from: { $gte: new Date(serviceDate) },
          "staff._id": staff[s]._id,
        }).and([{ to: { $lte: new Date(serviceDate) } }]);

        if (leaves && leaves.length > 0) continue;

        const user = await User.findById(req.body.userID);
        if (!user)
          return res
            .status(404)
            .send("The User doesn't exist with the given ID");

        const org = await Organization.findById(req.body.OrganizationID);
        if (!org) return res.status(404).send("Organization doesn't exist");

        let service = null;
        service = await Service.find({
          serviceName: req.query.service,
          "serviceOrgranization._id": req.query.organization,
        });

        if (!service) {
          service = await ServiceIndependent.find({
            serviceName: req.query.service,
            "serviceOrgranization._id": req.query.organization,
          });
        }

        if (!service) res.status(404).send("service doesn't exist");
        // let day_ = FullDate1.getDate();
        // let month_ = FullDate1.getMonth() + 1;
        // const year_ = FullDate1.getFullYear();
        const request = new UserRequest({
          fullName: req.body.fullName,
          Email: req.body.email,
          user: user,
          staffMemberAssigned: staff[s],
          Organization: org,
          VaccinationPlan: req.body.vaccination,
          Schedule:
            serviceDate.getFullYear() +
            "-" +
            parseInt(serviceDate.getMonth() + 1) +
            "-" +
            serviceDate.getDate(),
          Service: service[0],
          ServiceNeededTime: req.body.ServiceNeededTime,
          Address: req.body.Address,
          PhoneNo: req.body.PhoneNo,
          rated: false,
        });

        try {
          const requestSaved = await request.save();
          meetingsScheduledCount++;
          response.push(requestSaved);
        } catch (ex) {
          return res.status(400).send(ex.details[0].message);
        }
        if (req.query.servicePlan === "Daily") {
          serviceDate.setDate(serviceDate.getDate() + 1);
        }
      }
    }
    res.send(response);
  } else if (req.query.repeated && req.query.servicePlan === "Weekly") {
    //Phase 1: frist we schedule start date meeting
    //Phase 2: Then we schedule repeated weekly meeting

    const startDate = new Date(req.body.Schedule);
    const daysSelected = req.body.days;

    let staff = await Staff.find({
      staffSpeciality: { $elemMatch: { serviceName: req.query.service } },
      "Organization._id": req.query.organization,
    }).sort({ Rating: -1 });
    let totalWeeks = 0;
    let response = [];
    let serviceDate = null;
    //Phase 1: frist we schedule start date meeting starts..
    for (let s = 0; s < staff.length; s++) {
      serviceDate = new Date(req.body.Schedule);
      let day = new Date(serviceDate);
      let d = day.getDay();

      if (d === 0) {
        d = "SUN";
      } else if (d === 1) {
        d = "MON";
      } else if (d === 2) {
        d = "TUE";
      } else if (d === 3) {
        d = "WED";
      } else if (d === 4) {
        d = "THRU";
      } else if (d === 5) {
        d = "FRI";
      } else if (d === 6) {
        d = "SAT";
      }

      let checkDayAvailability = staff[s].availableDays.some(
        (staff) => staff.name === d && staff.value === true
      );
      if (!checkDayAvailability) continue;

      let staffContainsSlot = staff[s].availableTime.some(
        (staff) =>
          staff.time === req.body.ServiceNeededTime && staff.value === true
      );
      if (!staffContainsSlot) continue;

      const duties = await UserRequest.find({
        "staffMemberAssigned._id": staff[s]._id,
        Schedule:
          serviceDate.getDate() +
          "-" +
          parseInt(serviceDate.getMonth() + 1) +
          "-" +
          serviceDate.getFullYear(),
        ServiceNeededTime: req.body.ServiceNeededTime,
      });

      if (duties && duties.length > 0) continue;

      const leaves = await StaffLeave.find({
        from: { $gte: new Date(serviceDate) },
        "staff._id": staff[s]._id,
      }).and([{ to: { $lte: new Date(serviceDate) } }]);

      if (leaves && leaves.length > 0) continue;

      const user = await User.findById(req.body.userID);
      if (!user)
        return res.status(404).send("The User doesn't exist with the given ID");

      const org = await Organization.findById(req.body.OrganizationID);
      if (!org) return res.status(404).send("Organization doesn't exist");

      let service = null;
      service = await Service.find({
        serviceName: req.query.service,
        "serviceOrgranization._id": req.query.organization,
      });

      if (!service) {
        service = await ServiceIndependent.find({
          serviceName: req.query.service,
          "serviceOrgranization._id": req.query.organization,
        });
      }

      if (!service) res.status(404).send("service doesn't exist");
      // let day_ = FullDate1.getDate();
      // let month_ = FullDate1.getMonth() + 1;
      // const year_ = FullDate1.getFullYear();
      const request = new UserRequest({
        fullName: req.body.fullName,
        Email: req.body.email,
        user: user,
        staffMemberAssigned: staff[s],
        Organization: org,
        VaccinationPlan: req.body.vaccination,
        Schedule:
          serviceDate.getFullYear() +
          "-" +
          parseInt(serviceDate.getMonth() + 1) +
          "-" +
          serviceDate.getDate(),
        Service: service[0],
        ServiceNeededTime: req.body.ServiceNeededTime,
        Address: req.body.Address,
        PhoneNo: req.body.PhoneNo,
        rated: false,
      });

      try {
        const requestSaved = await request.save();

        response.push(requestSaved);
        break;
      } catch (ex) {
        return res.status(400).send(ex.details[0].message);
      }
    }

    //Phase 1: frist we schedule start date meeting ends..

    for (let s = 0; s < staff.length; s++) {
      //Phase 2 :starts..

      for (let i = 0; i < req.body.repeatedMeetingsNo; i++) {
        if (parseInt(totalWeeks) === parseInt(req.body.repeatedMeetingsNo) - 1)
          break;
        for (let days = 0; days < req.body.days.length; days++) {
          let weeklyCalculation = null;

          if (daysSelected[days].value === "MON") {
            weeklyCalculation = 1;
          } else if (daysSelected[days].value === "TUE") {
            weeklyCalculation = 2;
          } else if (daysSelected[days].value === "WED") {
            weeklyCalculation = 3;
          } else if (daysSelected[days].value === "THU") {
            weeklyCalculation = 4;
          } else if (daysSelected[days].value === "FRI") {
            weeklyCalculation = 5;
          } else if (daysSelected[days].value === "SAT") {
            weeklyCalculation = 6;
          } else if (daysSelected[days].value === "SUN") {
            weeklyCalculation = 7;
          }

          //if(days===0)

          serviceDate.setDate(
            serviceDate.getDate() +
              ((weeklyCalculation + 7 - serviceDate.getDay()) % 7 || 7)
          );
          // else
          //serviceDate.setDate(serviceDate.getDate() + (((weeklyCalculation + 7 - serviceDate.getDay()) % 7) || 7));

          let day = new Date(serviceDate);
          let d = day.getDay();

          if (d === 0) {
            d = "SUN";
          } else if (d === 1) {
            d = "MON";
          } else if (d === 2) {
            d = "TUE";
          } else if (d === 3) {
            d = "WED";
          } else if (d === 4) {
            d = "THRU";
          } else if (d === 5) {
            d = "FRI";
          } else if (d === 6) {
            d = "SAT";
          }

          let checkDayAvailability = staff[s].availableDays.some(
            (staff) => staff.name === d && staff.value === true
          );
          if (!checkDayAvailability) continue;

          let staffContainsSlot = staff[s].availableTime.some(
            (staff) =>
              staff.time === req.body.ServiceNeededTime && staff.value === true
          );
          if (!staffContainsSlot) continue;

          const duties = await UserRequest.find({
            "staffMemberAssigned._id": staff[s]._id.toString(),
            Schedule:
              serviceDate.getFullYear() +
              "-" +
              parseInt(serviceDate.getMonth() + 1) +
              "-" +
              serviceDate.getDate(),
            ServiceNeededTime: req.body.ServiceNeededTime,
          });

          if (duties && duties.length > 0) continue;

          const leaves = await StaffLeave.find({
            from: { $gte: new Date(serviceDate) },
            "staff._id": staff[s]._id,
          }).and([{ to: { $lte: new Date(serviceDate) } }]);

          if (leaves && leaves.length > 0) continue;

          const user = await User.findById(req.body.userID);
          if (!user)
            return res
              .status(404)
              .send("The User doesn't exist with the given ID");

          const org = await Organization.findById(req.body.OrganizationID);
          if (!org) return res.status(404).send("Organization doesn't exist");

          let service = null;
          service = await Service.find({
            serviceName: req.query.service,
            "serviceOrgranization._id": req.query.organization,
          });

          if (!service) {
            service = await ServiceIndependent.find({
              serviceName: req.query.service,
              "serviceOrgranization._id": req.query.organization,
            });
          }

          if (!service) res.status(404).send("service doesn't exist");
          // let day_ = FullDate1.getDate();
          // let month_ = FullDate1.getMonth() + 1;
          // const year_ = FullDate1.getFullYear();
          const request = new UserRequest({
            fullName: req.body.fullName,
            Email: req.body.email,
            user: user,
            staffMemberAssigned: staff[s],
            Organization: org,
            VaccinationPlan: req.body.vaccination,
            Schedule:
              serviceDate.getFullYear() +
              "-" +
              parseInt(serviceDate.getMonth() + 1) +
              "-" +
              serviceDate.getDate(),
            Service: service[0],
            ServiceNeededTime: req.body.ServiceNeededTime,
            Address: req.body.Address,
            PhoneNo: req.body.PhoneNo,
            rated: false,
          });

          try {
            const requestSaved = await request.save();
            if (days === req.body.days.length - 1) totalWeeks++;
            response.push(requestSaved);
          } catch (ex) {
            return res.status(400).send(ex.details[0].message);
          }
        }
      }
    }
    res.send(response);
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
      lat: req.body.lat,
      lng: req.body.lng,
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

  if (req.body.canceled) {
    const request = await UserRequest.findByIdAndUpdate(
      req.params.id,
      {
        canceled: req.query.status,
      },
      {
        new: true,
      }
    );

    if (!request)
      return res.status(404).send("Request with the given ID was not found.");

    res.send(request);
  } else {
    const staffMember = await Staff.findById(req.body.staffMemberID);
    if (!staffMember)
      return res
        .status(404)
        .send("Staff Member doesn't exist not found with the given ID");

    const organization = await Organization.findById(req.body.OrganizationID);
    if (!organization)
      return res
        .status(400)
        .send("Organization with the given ID doesn't exist");

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
        lat: req.body.lat,
        lng: req.body.lng,
        markers: req.body.markers,
        NotificationViewed: false,
        reschedule: false,
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
    }
    res.send("userRequest updated");
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
  } else if (req.query.rescheduleAppointment) {
    const request = await UserRequest.findByIdAndUpdate(
      req.query.id,
      {
        reschedule: req.body.status,
      },
      {
        new: true,
      }
    );

    if (!request)
      return res.status(404).send("Request with the given ID was not found.");

    res.send(request);
  } else if (req.query.rescheduleFalse) {
    const requests = await UserRequest.updateMany(
      {},
      { reschedule: req.body.status }
    );

    if (!requests)
      return res.status(404).send("Request with the given ID was not found.");

    res.send(requests);
  } else if (req.query.serviceCompleted) {
    const request = await UserRequest.findByIdAndUpdate(
      req.query.id,
      {
        completed: req.body.completeStatus,
      },
      {
        new: true,
      }
    );

    if (!request)
      return res.status(404).send("Request with the given ID was not found.");

    res.send(request);
  } else if (req.query.cancelService) {
    const userRequest = await UserRequest.findByIdAndUpdate(
      req.query.userRequestID,
      {
        $set: {
          canceled: true,
          // "staffMemberAssigned.Rating": req.body.Rating,
          // "staffMemberAssigned.RatingAvgCount": req.body.RatingAvgCount,
          // rated: true,
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
    else {
      const reqs = await UserRequest.find({});
      res.send(reqs);
    }
  }
});
module.exports = router;
