var courses = [{
        id: "CS161",
        name: "Intro 1"
    },
    {
        id: "CS162",
        name: "Intro 2",
        prereqs: ["CS161", "Test"]
    },
    {
        id: "CS352",
        name: "Introduction to Usability Engineering",
        elective: true
    }
];


var today, // Today's date
    oldestQuarter, // Date of the earliest quarter shown in the schedule
    newestQuarter, // Date of the lastest quarter shown in the schedule
    firstQuarterNum = 0; // Numeric representation of the first quarter (number of quarters before the current)

today = new Date();
today.setDate(1);
oldestQuarter = newestQuarter = today;
console.log(today);

// Setup drag and drop
var dragAndDrop = dragula({
    revertOnSpill: true,
    // Disallow anything but divs to be dragged
    invalid: function(el, handle) {
        return el.tagName != "DIV" || el.className.includes("prereq");
    }
});

// jquery after page loads
$(function() {

    buildCourses();

    // Label the initial quarter container with the current quarter
    $("#Q0").append(getQuarterName(today));

    // Add all of the places courses can be dragged to the drag and drop containers
    for (var i = 0; i < $(".container").length; dragAndDrop.containers.push($(".container")[i++]));
});

function buildCourses() {
    courses.forEach(function(course) {
        var html = "<div id='" + course.id + "'";
        if (course.elective) {
            html += " class='ele'";
        }
        html += "><strong>" + course.id + "</strong> - " + course.name + "</div>";
        $("#courses").append(html);
        if (course.prereqs) {
            $("#" + course.id).data(course.prereqs).addClass("prereq");
        }
    });
}

function getQuarterName(date) { return ["Wi", "Sp", "Su", "Fa"][Math.floor(date.getMonth() / 3)] + " - " + date.getFullYear(); }

// Get the current number of quarters displayed
function getNumOfQuarters() { return $("#quarters>div").length; }

// Add the next earliest quarter
function addPrev() {
    var prevQuarter = new Date(oldestQuarter.getFullYear(), oldestQuarter.getMonth() - 3),
        id = "Q" + --firstQuarterNum;

    $("#prevButton").after("<div id='" + id + "' class='container'>" + getQuarterName(prevQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    oldestQuarter = prevQuarter;
}

// Add the next latest quarter
function addNext() {
    var nextQuarter = new Date(newestQuarter.getFullYear(), newestQuarter.getMonth() + 3),
        id = "Q" + (getNumOfQuarters() + firstQuarterNum);

    $("#nextButton").before("<div id='" + id + "' class='container'>" + getQuarterName(nextQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    newestQuarter = nextQuarter;
}