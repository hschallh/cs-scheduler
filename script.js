// Classes with their codes, names, prereqs, and whether or not they are an elective
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
        CS467: {
        name: "Software Projects",
        prereqs: ["CS361"]
    },
    CS352: {
        name: "Introduction to Usability Engineering",
        elective: true,
        prereqs: ["CS161"]
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
    }
};

var today, // Today's date
    oldestQuarter, // Date of the earliest quarter shown in the schedule
    newestQuarter, // Date of the lastest quarter shown in the schedule
    firstQuarterNum = 0; // Numeric representation of the first quarter (number of quarters before the current)

today = new Date();
oldestQuarter = newestQuarter = today;

removedContainers = [];

// Setup drag and drop
var dragAndDrop = dragula({
    revertOnSpill: true,
    // Disallow anything but courses with satisfied prereqs to be moved
    invalid: function(el, handle) {
        return el.className.includes("prereq");
    }
});

// Any time a course is picked up
dragAndDrop.on("drag", function(el, source) {

    // Disallow drops into a quarter before its prereq
    if (courses[el.id].prereqs) {
        var earliestValidQuarter = getCoursesEarliestQuarter(el.id);

        for (var i = firstQuarterNum; i < earliestValidQuarter; i++) {
            removeContainer("#Q" + i);
        }
        removeContainer("#prevButton");
    }

    // Disallow drops into a quarter after a course if it's one of its prereq
    var latestValidQuarter = getCoursesLatestQuarter(el.id);

    if (latestValidQuarter !== undefined) {
        for (var i = latestValidQuarter + 1; i < getNumOfQuarters() + firstQuarterNum; i++) {
            removeContainer(("#Q" + i));
        }
        removeContainer("#nextButton");
    }
});

// Any time a course is dropped
dragAndDrop.on("dragend", function() {
    restoreRemovedContainers();
});

// Any time a course is moved to a quarter or the course bucket
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

    updatePrereqs();
});

// jquery after page loads
$(function() {

    // Build html elements for each of the courses
    for (var id in courses) {
        var html = "<div id='" + id + "'><strong>" + id + "</strong> - " + courses[id].name + "</div>";
        $("#courses").append(html);

        if (courses[id].elective) {
            $("#" + id).addClass("ele");
            $("#" + id).attr("title", "Elective");
        }
        if (courses[id].prereqs) {
            $("#" + id).addClass("prereq");
            $("#" + id).attr("title", $("#" + id).attr("title") + ", Prereqs: " + courses[id].prereqs);
        }
    }

    // Label the initial quarter container with the current quarter
    $("#Q0").append(getQuarterName(today));

    // register all of the places courses can be dragged to with the drag/drop handler
    for (var i = 0; i < $(".container").length; dragAndDrop.containers.push($(".container")[i++]));
});

// Diallow drops into a container
function removeContainer(id) {
    console.log("removing", id);
    removedContainers.push(id);
    $(id).addClass("invalid");
    var index = dragAndDrop.containers.indexOf($(id)[0]);
    dragAndDrop.containers.splice(index, 1);
}

// Reallow drops in any containers removed due to prereqs
function restoreRemovedContainers() {
    removedContainers.forEach(function(id) {
        console.log("restoring", id);
        dragAndDrop.containers.push($(id)[0]);
        $(id).removeClass("invalid");
    });
    removedContainers = [];
}

// Get the earliest quarter a course with prereqs can be dropped into
function getCoursesEarliestQuarter(id) {
    var earliestValidQuarter = firstQuarterNum;

    // Get the earliest quarter the course can be dropped into
    courses[id].prereqs.forEach(function(prereq) {
        var prereqQuarter = +($("#" + prereq).parent().attr('id').slice(1));
        if (prereqQuarter >= earliestValidQuarter) {
            earliestValidQuarter = (id == "CS340") ? prereqQuarter : prereqQuarter + 1;
        }
    });
    return earliestValidQuarter;
}

// Get the latest quarter a course that is a prereq can be dropped into
function getCoursesLatestQuarter(id) {
    var latestValidQuarter;
    $("#quarters>.container>*").each(function() {
        if (courses[this.id].prereqs && courses[this.id].prereqs.indexOf(id) >= 0) {
            var postreqQuarter = +($("#" + this.id).parent().attr('id').slice(1));
            if (latestValidQuarter === undefined || postreqQuarter <= latestValidQuarter) {
                latestValidQuarter = (this.id == "CS340") ? postreqQuarter : postreqQuarter - 1;
            }
        }
    });
    return latestValidQuarter;
}


// Remove courses from quarters if their prereq has been removed. Allow dragging
// and dropping for courses whose prereqs have been satisfied.
function updatePrereqs() {
    for (var id in courses) {
        if (courses[id].prereqs) {
            var satisfied = true;
            courses[id].prereqs.forEach(function(prereq) {
                if ($("#" + prereq).parent()[0] == $("#courses")[0]) {
                    // If this course's prereq course not been assigned to a quarter,disallow drag and drop
                    $("#" + id).addClass("prereq");
                    satisfied = false;

                    // If this course had been assigned a quarter, move it back to the course bucket
                    if ($("#" + id).parent().parent()[0] == $("#quarters")[0]) {
                        $(sibling).before($("#" + id));
                    }
                }
            });

            // If all this course's prereqs have been assigned a quarter, allow drag and drop
            if (satisfied) $("#" + id).removeClass("prereq");
        }
    }
}

// Get the name of a quarter as a two character string and year
function getQuarterName(date) { return ["Wi", "Sp", "Su", "Fa"][Math.floor(date.getMonth() / 3)] + " - " + date.getFullYear(); }

// Get the current number of quarters displayed
function getNumOfQuarters() { return $("#quarters>div").length; }

// Add a container for the next earliest quarter
function addPrev() {
    var prevQuarter = new Date(oldestQuarter.getFullYear(), oldestQuarter.getMonth() - 3),
        id = "Q" + --firstQuarterNum;

    $("#prevButton").after("<div id='" + id + "' class='container'>" + getQuarterName(prevQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    oldestQuarter = prevQuarter;

    return id;
}

// Add a container for the next earliest quarter
function addNext() {
    var nextQuarter = new Date(newestQuarter.getFullYear(), newestQuarter.getMonth() + 3),
        id = "Q" + (getNumOfQuarters() + firstQuarterNum);

    $("#nextButton").before("<div id='" + id + "' class='container'>" + getQuarterName(nextQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    newestQuarter = nextQuarter;

    return id;
}
