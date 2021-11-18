const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");

const { StaffDuties } = require("../models/staffDutiesSchema");
const {
  BookedSlots,
  validateBookedSlots,
} = require("../models/slotBookedSchema");

router.get("/", async (req, res) => {
  if (req.query.day) {
    const bookedSlots = await BookedSlots.find({ day: req.query.day });
    res.send(bookedSlots);
  }
  const bookedSlots = await BookedSlots.find();

  res.send(bookedSlots);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Booked Slot not found with the given ID");
  const bookedSlots = await BookedSlots.findById(req.params.id);
  if (!bookedSlots)
    return res.status(404).send("Booked Slot found with the given ID");

  res.send(bookedSlots);
});

router.post("/", async (req, res) => {
  const { error } = validateBookedSlots(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffDuty = await StaffDuties.findById(req.body.staffDutyID);

  if (!staffDuty)
    return res.status(404).send("Staff doesn't exist with the given ID");

  const bookedSlots = new BookedSlots({
    staffDuty: staffDuty,
    BookedSlotFrom: req.body.BookedSlotFrom,
    BookedSlotTo: req.body.BookedSlotTo,
  });

  try {
    const bookedSlotsGot = await bookedSlots.save();
    res.send(bookedSlotsGot);
  } catch (ex) {
    return res.status(400).send(ex.details[0].message);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateStaffDuty(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Booked Slots not found with the given ID. ");

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const staffDuty = await StaffDuties.findById(req.body.staffDutyID);

  if (!staffDuty)
    return res.status(404).send("Staff doesn't exist with the given ID");

  const bookedSlots = await BookedSlots.findByIdAndUpdate(
    req.params.id,
    {
      staff: staffDuty,
      BookedSlotFrom: req.body.From,
      BookedSlotTo: req.body.To,
    },
    {
      new: true,
    }
  );

  if (!bookedSlots)
    return res.status(404).send("booked Slot with the given ID was not found.");

  res.send(bookedSlots);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Booked Slot not found with the given ID ");
  const bookedSlots = await BookedSlots.findByIdAndRemove(req.params.id);
  if (!bookedSlots)
    return res.status(404).send("Booked Slot not found with the given ID");
  res.send(bookedSlots);
});

module.exports = router;
