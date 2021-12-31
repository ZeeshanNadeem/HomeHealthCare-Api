const express = require("express");
const {
  Available,
  validateAvailabilty,
} = require("../models/availablityStatusSchema");

const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  if (req.query.timeSlot) {
    const available = await Available.find({
      SlotTime: req.query.timeSlot,
    });

    res.send(available);
  } else {
    const available = await Available.find();
    res.send(available);
  }
});

router.post("/", async (req, res) => {
  const { error } = validateAvailabilty(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const availablity = new Available({
    SlotTime: req.body.SlotTime,
    SlotBooked: req.body.SlotBooked,
  });

  try {
    const Saved = await availablity.save();
    res.send(Saved);
  } catch (ex) {
    res.send(ex);
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Availablity not found with the given ID ");

  const result = await Available.findByIdAndRemove(req.params.id);
  if (!result)
    return res.status(404).send("Availability not found with the given ID");
  res.send(result);
});

router.put("/:id", async (req, res) => {
  const { error } = validateAvailabilty(req.body);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid ID ");
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const result = await Available.findByIdAndUpdate(
    req.params.id,
    {
      SlotTime: req.body.SlotTime,
      SlotBooked: req.body.SlotBooked,
    },
    {
      new: true,
    }
  );

  if (!result)
    return res
      .status(404)
      .send("Availability with the given ID was not found.");

  res.send(result);
});

module.exports = router;
