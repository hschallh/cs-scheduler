var courses = {
    CS161: {
        name: "Intro 1"
    },
    CS225: {
        name: "Discrete Structures",
    },
    CS162: {
        name: "Intro 2",
        prereqs: ["CS161"]
    },
    CS352: {
        name: "Introduction to Usability Engineering",
        elective: true,
        prereqs: ["CS161"]
    },
    CS271: {
        name: "Computer Architecture & Assembly Language",
        prereqs: ["CS161"]
    },
    CS261: {
        name: "Data Structures",
        prereqs: ["CS162", "CS225"]
    },
    CS290: {
        name: "Web Development",
        prereqs: ["CS162"]
    },
    CS340: {
        name: "Introduction to Databases",
        prereqs: ["CS290"]
    },
    CS325: {
        name: "Analysis of Algorithms",
        prereqs: ["CS261", "CS225"]
    },
    CS344: {
        name: "Operating Systems",
        prereqs: ["CS261", "CS271"]
    },
    CS361: {
        name: "Software Engineering I",
        prereqs: ["CS261"]
    },
    CS362: {
        name: "Software Engineering II",
        prereqs: ["CS261"]
    },
    CS372: {
        name: "Intro to Computer Networks",
        prereqs: ["CS271", "CS261"]
    },
    CS475: {
        name: "Parallel Programming",
        elective: true,
        prereqs: ["CS261"]
    },
    CS373: {
        name: "Defense Against the Dark Arts",
        elective: true,
        prereqs: ["CS340", "CS372", "CS344"]
    },
    CS464: {
        name: "Open Source Software Development",
        elective: true,
        prereqs: ["CS361"]
    },
    CS496: {
        name: "Mobile and Cloud Software Development",
        elective: true,
        prereqs: ["CS344"]
    },
    CS467: {
        name: "Software Projects",
        elective: true,
        prereqs: ["CS361"]
    }
};


var today, // Today's date
    oldestQuarter, // Date of the earliest quarter shown in the schedule
    newestQuarter, // Date of the lastest quarter shown in the schedule
    firstQuarterNum = 0; // Numeric representation of the first quarter (number of quarters before the current)

today = new Date();
today.setDate(1);
oldestQuarter = newestQuarter = today;
console.log(today);

removedContainers = [];

// Setup drag and drop
var dragAndDrop = dragula({
    revertOnSpill: true,
    // Disallow anything but courses with satisfied prereqs to be moved
    invalid: function(el, handle) {
        return el.className.includes("prereq");
    }
});

dragAndDrop.on("drag", function(el, source) {
    if (courses[el.id].prereqs) {
        var latestValidQuarter = firstQuarterNum;
        courses[el.id].prereqs.forEach(function(prereq) {
            var prereqQuarter = +($("#" + prereq).parent().attr('id').slice(1));
            if (prereqQuarter >= latestValidQuarter) {
                latestValidQuarter = (el.id == "CS340") ? prereqQuarter : prereqQuarter + 1;
            }
        });
        for (var i = firstQuarterNum; i < latestValidQuarter; i++) {
            removedContainers.push("#Q" + i);
            var index = dragAndDrop.containers.indexOf($("#Q" + i)[0]);
            dragAndDrop.containers.splice(index, 1);
            $("#Q" + i).addClass("invalid");
        }
        removedContainers.push("#prevButton");
        var index = dragAndDrop.containers.indexOf($("#prevButton")[0]);
        dragAndDrop.containers.splice(index, 1);
        $("prevButton").addClass("invalid");
    }
});

dragAndDrop.on("dragend", function() {
    removedContainers.forEach(function(id) {
        dragAndDrop.containers.push($(id)[0]);
    });
    removedContainers = [];
});

// Any time the schedule is changed
dragAndDrop.on("drop", function(el, target, source, sibling) {

    // If the course was dropped into a button, "click" the button and move the
    // course to the newly created quarter
    if (target.id == "prevButton") {
        var newQuarter = addPrev();
        $("#" + newQuarter).append(el);
    } else if (target.id == "nextButton") {
        var newQuarter = addNext();
        $("#" + newQuarter).append(el);
    }

    // add prereq class to courses with unsatisfied prereqs by checking if the
    // course prereqs are still in the courses container.
    for (var id in courses) {
        if (courses[id].prereqs) {
            var satisfied = true;
            courses[id].prereqs.forEach(function(prereq) {
                if ($("#" + prereq).parent()[0] == $("#courses")[0]) {
                    if ($("#" + id).parent().parent()[0] == $("#quarters")[0]) {
                        $(sibling).before($("#" + id));
                    }
                    $("#" + id).addClass("prereq");
                    satisfied = false;
                }
            });
            if (satisfied) $("#" + id).removeClass("prereq");
        }
    }
});

// jquery after page loads
$(function() {

    // Build html elements for each of the courses
    for (var id in courses) {
        var html = "<div id='" + id + "'";
        html += "><strong>" + id + "</strong> - " + courses[id].name + "</div>";
        $("#courses").append(html);

        if (courses[id].elective) $("#" + id).addClass("ele");
        if (courses[id].prereqs) $("#" + id).addClass("prereq");
    }

    // Label the initial quarter container with the current quarter
    $("#Q0").append(getQuarterName(today));

    // register all of the places courses can be dragged to with the drag/drop handler
    for (var i = 0; i < $(".container").length; dragAndDrop.containers.push($(".container")[i++]));
});

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

    return id;
}

// Add the next latest quarter
function addNext() {
    var nextQuarter = new Date(newestQuarter.getFullYear(), newestQuarter.getMonth() + 3),
        id = "Q" + (getNumOfQuarters() + firstQuarterNum);

    $("#nextButton").before("<div id='" + id + "' class='container'>" + getQuarterName(nextQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    newestQuarter = nextQuarter;

    return id;
}