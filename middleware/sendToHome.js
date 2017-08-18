// if a logged in user is trying to go to the home page, take them to their family page
module.exports = function sendToHome(res, res, next) {
  res.locals.home = "/families/" + user.family.name;
  if (req.path === "/") return res.redirect(res.locals.home);
  next();
};
