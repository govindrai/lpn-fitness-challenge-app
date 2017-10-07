// Modules
const express = require("express"),
  _ = require("lodash"),
  pug = require("pug"),
  path = require("path");

// Models
const User = require("./../models/user"),
  Family = require("./../models/family"),
  Point = require("./../models/point");

// Middleware
const isAdmin = require("./../middleware/isAdmin");

const router = express.Router();

router.get("/admin-settings", isAdmin, (req, res, next) => {
  let adminss, nonAdminss;
  User.getAdmins()
    .then(admins => {
      adminss = admins;
      return User.getNonAdmins();
    })
    .then(nonAdmins => {
      nonAdminss = nonAdmins;
      res.render("users/admin_settings", {
        admins: adminss,
        nonAdmins: nonAdminss,
        path: req.path
      });
    });
});

// edit points for a user for certain day
router.put("/points", (req, res) => {
  const { participation } = req.body;
  res.locals.user.participationId = participation;
  const addPointsButtonDate = new Date(req.body.addPointsButtonDate);
  const familyParticipations = [{ _id: participation, user: res.locals.user }];
  Point.calculateParticipantPointsByDay(
    familyParticipations,
    addPointsButtonDate,
    res.locals.user
  )
    .then(() => {
      return res.render("points/newandedit", {
        familyParticipations,
        addPointsButtonDate,
        editRequest: true
      });
    })
    .catch(e => console.log(e));
});

// GET user profile edit form
router.get("/:id/edit", (req, res) => res.render("users/edit"));

// handles both admin changes as well as profile edits
router.put("/:id", (req, res) => {
  if (req.body.changeAdmin) {
    User.findById(req.body.userId)
      .then(user => {
        return user.update({ $set: { admin: !user.admin } });
      })
      .then(user =>
        res.send(
          `${user.fullName()} ${user.admin
            ? "is now an admin"
            : "is no longer an admin"}`
        )
      )
      .catch(e => console.log(e));
  } else {
    const body = _.pick(req.body, [
      "name.first",
      "name.last",
      "name.nickname",
      "email",
      "password"
    ]);

    const emailNotModified = res.locals.user.email === body.email;
    const passwordNotModified = body.password === "";

    if (emailNotModified) {
      delete body.email;
    }
    const promisesArray = [];

    let hashPasswordPromise;

    if (passwordNotModified) {
      delete body.password;
    } else {
      hashPasswordPromise = function() {
        return User.hashPassword(body.password).then(
          hash => (body.password = hash)
        );
      };
    }

    updateUserPromise = function() {
      return User.findOneAndUpdate(
        { _id: res.locals.user._id },
        { $set: body },
        { new: true, runValidators: true }
      )
        .then(user => {
          return res.redirect(`/users/${user.email}?updated=true`);
        })
        .catch(e => console.log(e));
    };

    if (hashPasswordPromise) {
      hashPasswordPromise().then(() => updateUserPromise());
    } else {
      updateUserPromise();
    }
  }
});

router.get("/:email", (req, res) => {
  User.findOne({ email: req.params.email })
    .populate("family")
    .then(user => {
      res.render("users/show", {
        user,
        currentUser: res.locals.user,
        successMessage: req.query.updated
      });
    });
});

module.exports = router;
