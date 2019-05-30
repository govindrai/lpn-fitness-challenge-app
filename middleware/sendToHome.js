// if a logged in user is trying to go to the home page, take them to their family page
const Logger = require('../utils/logger');

const logger = new Logger('middleware:sendToHome');

module.exports = async function sendToHome(req, res, next) {
  logger.entered();

  // if there is no active challenge redirect to the user's profile page
  // otherwise redirect them to their family's challenge page
  if (!res.locals.currentChallenge) {
    res.redirect(`/users/${res.locals.user._id}`);
  } else {
    res.redirect(`/families/${res.locals.user.family.name}`);
  }
};
