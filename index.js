// Modules
const express = require("express"),
  favicon = require("serve-favicon"),
  methodOverride = require("method-override"),
  session = require("express-session"),
  { REDIS_URL } = require("./config/keys"),
  redis = require("redis"),
  client = redis.createClient(REDIS_URL),
  RedisStore = require("connect-redis")(session),
  path = require("path"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  sassMiddleware = require("node-sass-middleware"),
  mongoose = require("./config/db/mongoose");

const index = require("./routes/index"),
  users = require("./routes/users"),
  families = require("./routes/families"),
  units = require("./routes/units"),
  activities = require("./routes/activities"),
  challenges = require("./routes/challenges"),
  points = require("./routes/points"),
  participations = require("./routes/participations");

// Models
const Family = require("./models/family"),
  User = require("./models/user");

// Middleware
var verifyAuthorization = require("./middleware/verifyAuthorization");
var sendToHome = require("./middleware/sendToHome");
var setLocals = require("./middleware/setLocals");

// Create Express App
var app = express();

// Setup View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(favicon(path.join(__dirname, "public/images", "favicon.ico")));
app.use(methodOverride("_method"));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    store: new RedisStore({ client }),
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 7776000000 }, // 90 days
    secret: process.env.COOKIE_SECRET || "secret"
  })
);

app.use(
  sassMiddleware({
    src: path.join(__dirname, "public/stylesheets"),
    dest: path.join(__dirname, "public/stylesheets"),
    debug: true,
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
    prefix: "/stylesheets"
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/libs",
  express.static(path.join(__dirname, "/node_modules/jquery/dist/"))
);
app.use(
  "/libs",
  express.static(path.join(__dirname, "/node_modules/typeahead.js/dist/"))
);

// these middleware are run before any route is rendered below
app.use(verifyAuthorization, sendToHome, setLocals);
app.use("/", index);
app.use("/users", users);
app.use("/families", families);
app.use("/units", units);
app.use("/activities", activities);
app.use("/challenges", challenges);
app.use("/points", points);
app.use("/participations", participations);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

client.on("connect", function() {
  console.log("connected to redis client");
});

module.exports = app;