// updates the #showBody container upon request of new date/week
function updateShow(e) {
  let weekInfo;

  // if changing weeks, send change direction and
  // monday's and sunday's dates (depending on direction, one is important)
  // in order to calculate the new week's dates
  if ($(e.target).hasClass("change-week")) {
    weekInfo = {
      direction: $(this).attr("id"),
      sunday: $("#sunday").data("date"),
      monday: $("#monday").data("date")
    };
    // otherwise is changing to a different date in the same week
    // send the requested date with a direction of none
    // and monday's date to calculate entire week's dates
  } else {
    weekInfo = {
      date: $(e.currentTarget)
        .find(".date")
        .data("date"),
      monday: $("#monday").data("date"),
      direction: "none"
    };
  }

  // send the weekInfo object and update the #showBody container
  $.ajax({
    url: window.location.pathname,
    data: { weekInfo }
  })
    .done(res => $("#showBody").html(res))
    .fail(() => console.log("Updating show failed"));
}

//
function removePointEntry(e) {
  $(e.target)
    .parent()
    .remove();
  calculateTotalPoints();
}

function showAddPointsModal(e) {
  if ($(this).attr("id") === "edit-points") {
    $(".total-calculated-points").css("display", "block");
    calculateTotalPoints();
  }
  if ($(".point-entries").children.length > 0) {
    $("#submit-points-button").css("display", "block");
  }
  $("#add-points-container").toggle();
  window.scrollTo(0, 0);
  getActivities();
  $("#typeahead").bind("typeahead:select", getActivityData);
}

function hideAddPointsModal() {
  $("#add-points-container").toggle();
}

function getActivities() {
  $.ajax({
    url: "/activities"
  }).done(function(res) {
    var activitiesFn = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: res
    });

    $("#typeahead").typeahead(
      {
        minLength: 1,
        highlight: true
      },
      {
        name: "my-dataset",
        source: activitiesFn
      }
    );
    $(".twitter-typeahead").css("display", "block");
  });
}

/* gets information about an selected activity  */
function getActivityData(ev, suggestion) {
  var request = $.ajax({
    url: `/activities/${suggestion}`
  });

  request.done(res => {
    $("#typeahead").typeahead("val", "");
    $(".point-entries").append(res);
    $("#submit-points-button").css("display", "block");
    $(".total-calculated-points").css("display", "block");
  });

  request.fail(res => {
    console.log("FAIL in get activity data", res);
  });
}

function calculateEntryPoints(e) {
  var pointsEntry = $(this)
    .parent()
    .parent();

  var activityPoints = pointsEntry.find(".activity-points").text();
  var activityPointsScale = pointsEntry.find(".activity-points-scale").text();

  var numOfUnits = $(this).val();

  if (numOfUnits == "") {
    pointsEntry.find("input.calculated-points").val(0);
    pointsEntry.find("div.calculated-points").text("0 POINTS");
  } else {
    var calculation = (parseFloat(activityPoints) /
      parseFloat(activityPointsScale) *
      parseFloat(numOfUnits)).toFixed(2);
    pointsEntry.find("input.calculated-points").val(calculation);
    pointsEntry.find("div.calculated-points").text(calculation + " POINTS");
  }
  calculateTotalPoints();
}

function calculateTotalPoints() {
  const totalCalculatedPoints = $.makeArray($("input.calculated-points"))
    .reduce(
      (total, pointsEntryValue) =>
        total +
        ($(pointsEntryValue).val() === ""
          ? 0
          : parseFloat($(pointsEntryValue).val())),
      0
    )
    .toFixed(2);

  $("div.total-calculated-points").text(
    "TOTAL = " + totalCalculatedPoints + " POINTS"
  );
  $("input.total-calculated-points").val(totalCalculatedPoints);
}

function getTimeRemaining(endOfWeek) {
  const total = Date.parse(endOfWeek) - Date.parse(new Date()),
    days = Math.floor(total / (1000 * 60 * 60 * 24)),
    hours = Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes = Math.floor((total / 1000 / 60) % 60);
  document.getElementById(
    "timeRemaining"
  ).innerHTML = `${days} DAYS, ${hours} HOURS, ${minutes} MINUTES`;
}

function initializeClock() {
  const endtime = new Date($("#sunday").data("date"));
  endtime.setDate(endtime.getDate() + 1);

  var clock = document.getElementById("timeRemaining");
  var timeinterval = setInterval(() => getTimeRemaining(endtime), 1000);
}

$(document).ready(function() {
  initializeClock();
});

function toggleParticipantPoints(e) {
  $(this)
    .find(".points-entries-summaries")
    .slideToggle();
}

$("body").on("click", ".participant", toggleParticipantPoints);
$("body").on("click", ".change-week", updateShow);
$("body").on("click", ".updatePoints", updateShow);
$("body").on("click", "#add-points-button", showAddPointsModal);
$("body").on("click", "#edit-points", showAddPointsModal);
$("body").on("click", "#x-button", hideAddPointsModal);
$("body").on("keyup", ".num-of-units", calculateEntryPoints);
$("body").on("click", ".trash", removePointEntry);
