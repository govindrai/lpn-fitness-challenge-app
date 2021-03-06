// Modules
const express = require('express');


// Models
const User = require('./../models/user');
const Point = require('./../models/point');

// Middleware
const isAdmin = require('./../middleware/isAdmin');

const { wrap } = require('../utils/utils');

const router = express.Router();

router.get('/admin-settings', isAdmin, (req, res, next) => {
  let adminss;
  let nonAdminss;
  User.getAdmins()
    .then(admins => {
      adminss = admins;
      return User.getNonAdmins();
    })
    .then(nonAdmins => {
      nonAdminss = nonAdmins;
      res.render('users/admin_settings', {
        admins: adminss,
        nonAdmins: nonAdminss,
        path: req.path,
      });
    });
});

// edit points for a user for certain day
router.put('/points', (req, res) => {
  const { participant } = req.body;
  // res.locals.user.participantId = participant;
  const addPointsButtonDate = new Date(req.body.addPointsButtonDate);
  const familyParticipants = [{ _id: participant, user: res.locals.user }];
  Point.calculateParticipantPointsByDay(familyParticipants, addPointsButtonDate, res.locals.user)
    .then(() => res.render('points/_points_entries', {
      familyParticipants,
      // addPointsButtonDate,
      // editRequest: true
    }))
    .catch(e => console.log(e));
});


// GET a user's landing page
router.get(
  '/:id',
  wrap(async (req, res, next) => {
    const ranksProm = res.locals.user.getRankedUser();
    const numOfChallengesCompletedProm = res.locals.user.getNumOfChallengesCompleted(res.locals.currentChallenge);
    const [numOfChallengesCompleted] = await Promise.all([numOfChallengesCompletedProm, ranksProm]);
    // TODO: the view name should be different and should redirect to a user's personal landing page when there are no challenges. :)
    return res.render('families/no_challenge', { numOfChallengesCompleted });
  })
);

// TODO: add private route middleware

module.exports = router;
