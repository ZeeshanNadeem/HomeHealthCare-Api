const config = require("config");
const express = require("express");
const mongoose = require("mongoose");
// const doctors = require("./routes/doctors");
const staff = require("./routes/staff");
const services = require("./routes/services");
const qualification = require("./routes/qualification");
const organization = require("./routes/organization");
const staffType = require("./routes/staffType");
const staffDuties = require("./routes/staffDuties");
const bookedSlot = require("./routes/bookedSlots");
const userRequests = require("./routes/userRequests");
const user = require("./routes/user");
const auth = require("./routes/auth");
const app = express();

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept, Authorization"
  );
  next();
});

app.use(express.json());
app.use("/api/staff", staff);
app.use("/api/services", services);
app.use("/api/bookedSlots", bookedSlot);
app.use("/api/qualification", qualification);
app.use("/api/organizations", organization);
app.use("/api/staffDuties", staffDuties);
app.use("/api/staffType", staffType);
app.use("/api/userRequests", userRequests);

app.use("/api/user", user);
app.use("/api/auth", auth);
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

mongoose
  .connect("mongodb://localhost/HomeHeathCare")
  .then(() => console.log("Connected To Mongo DB"))
  .catch((err) => console.log("Could not connect to Mongo DB"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
