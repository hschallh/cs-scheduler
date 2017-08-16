var courses = [{
        id: "CS161",
        name: "Intro 1"
    },
    {
        id: "CS225",
        name: "Discrete Structures",
    },
    {
        id: "CS162",
        name: "Intro 2",
        prereqs: ["CS161"]
    },
    {
        id: "CS352",
        name: "Introduction to Usability Engineering",
        elective: true,
        prereqs: ["CS161"]
    },
    {
        id: "CS271",
        name: "Computer Architecture & Assembly Language",
        prereqs: ["CS161"]
    },
    {
        id: "CS261",
        name: "Data Structures",
        prereqs: ["CS162", "CS225"]
    },
    {
        id: "CS290",
        name: "Web Development",
        prereqs: ["CS162"]
    },
    {
        id: "CS340",
        name: "Introduction to Databases",
        prereqs: ["CS290"]
    },
    {
        id: "CS325",
        name: "Analysis of Algorithms",
        prereqs: ["CS261", "CS225"]
    },
    {
        id: "CS344",
        name: "Operating Systems",
        prereqs: ["CS261", "CS271"]
    },
    {
        id: "CS361",
        name: "Software Engineering I",
        prereqs: ["CS261"]
    },
    {
        id: "CS362",
        name: "Software Engineering II",
        prereqs: ["CS261"]
    },
    {
        id: "CS372",
        name: "Intro to Computer Networks",
        prereqs: ["CS271", "CS261"]
    },
    {
        id: "CS475",
        name: "Parallel Programming",
        elective: true,
        prereqs: ["CS261"]
    },
    {
        id: "CS373",
        name: "Defense Against the Dark Arts",
        elective: true,
        prereqs: ["CS340", "CS372", "CS344"]
    },
    {
        id: "CS464",
        name: "Open Source Software Development",
        elective: true,
        prereqs: ["CS361"]
    },
    {
        id: "CS496",
        name: "Mobile and Cloud Software Development",
        elective: true,
        prereqs: ["CS344"]
    },
    {
        id: "CS467",
        name: "Software Projects",
        elective: true,
        prereqs: ["CS361"]
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

dragAndDrop.on("drop", function(el, target, source, sibling) {
    updatePrereqs();
});

// jquery after page loads
$(function() {

    buildCourses();

    // Label the initial quarter container with the current quarter
    $("#Q0").append(getQuarterName(today));

    // Add all of the places courses can be dragged to the drag and drop containers
    for (var i = 0; i < $(".container").length; dragAndDrop.containers.push($(".container")[i++]));
});

// Creates HTML elements of each of the courses
function buildCourses() {
    courses.forEach(function(course) {
        var html = "<div id='" + course.id + "'";
        html += "><strong>" + course.id + "</strong> - " + course.name + "</div>";
        $("#courses").append(html);

        if (course.elective) $("#" + course.id).addClass("ele");
        if (course.prereqs) $("#" + course.id).addClass("prereq");
    });
}

// Add prereq class to courses with unsatisfied prereqs by checking if the
// course is still in the courses container.
function updatePrereqs() {
    courses.forEach(function(course) {
        if (course.prereqs) {
            var satisfied = true;
            course.prereqs.forEach(function(prereq) {
                if ($("#" + prereq).parent()[0] == $("#courses")[0]) {
                    $("#" + course.id).addClass("prereq");
                    satisfied = false;
                }
            });
            if (satisfied) $("#" + course.id).removeClass("prereq");
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