// Classes with their codes, names, prereqs, and whether or not they are an elective
var courses = {
    CS165: {
        name: "Introduction to Computer Science I/II",
        restrictedTo: ["Fall", "Winter", "Spring"]
    },
    CS161: {
        name: "Introduction to Computer Science I"
    },
    CS162: {
        name: "Introduction to Computer Science II",
        prereqs: ["CS161"]
    },
    CS225: {
        name: "Discrete Structures",
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
        prereqs: ["CS361", "CS344"],
        note: "Must be taken in the final quarter"
    },
    CS352: {
        name: "Introduction to Usability Engineering",
        elective: true,
        prereqs: ["CS161"]
    },
    CS475: {
        name: "Parallel Programming",
        elective: true,
        prereqs: ["CS261"],
        restrictedTo: ["Spring"]
    },
    CS373: {
        name: "Defense Against the Dark Arts",
        elective: true,
        prereqs: ["CS340", "CS372", "CS344"],
        restrictedTo: ["Winter", "Summer"]
    },
    CS464: {
        name: "Open Source Software Development",
        elective: true,
        prereqs: ["CS361"],
        restrictedTo: ["Summer", "Fall", "Spring"]
    },
    CS492: {
        name: "Mobile Software Development",
        elective: true,
        prereqs: ["CS344"],
        note: "The availability of this class and prereqs are purely speculation. Should be offered starting 2019"
    },
    CS493: {
        name: "Cloud Software Development",
        elective: true,
        prereqs: ["CS290", "CS340", "CS372"],
        restrictedTo: ["Fall", "Spring"]
    },
    CS496: {
        name: "Mobile and Cloud Software Development",
        elective: true,
        prereqs: ["CS344"],
        note: "This class is no longer available as of the summer 2018"
    }
};

var cs165 = false;

var today, // Today's date
    oldestQuarter, // Date of the earliest quarter shown in the schedule
    newestQuarter, // Date of the lastest quarter shown in the schedule
    firstQuarterNum = 0; // Numeric representation of the first quarter (number of quarters after the current)

removedContainers = [];

// Setup drag and drop
var dragAndDrop = dragula({
    revertOnSpill: true,
    // Disallow anything but courses with satisfied prereqs to be moved
    invalid: function (el, handle) {
        return el.className.includes("unsatisfied");
    }
});

// Any time a course is picked up
dragAndDrop.on("drag", function (el, source) {

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

    // Visually indicate - buttons are not containers
    $("#removePrevButton").addClass("invalid");
    $("#removeNextButton").addClass("invalid");
});

// Any time a course is dropped
dragAndDrop.on("dragend", function () {
    restoreRemovedContainers();

    // Restore look of - buttons
    $("#removePrevButton").removeClass("invalid");
    $("#removeNextButton").removeClass("invalid");
});

// Any time a course is moved to a quarter or the course bucket
dragAndDrop.on("drop", function (el, target, source, sibling) {

    // If the course was dropped into a button, "click" the button and move the
    // course to the newly created quarter
    if (target.id == "prevButton") {
        var newQuarter = addPrev();
        $("#" + newQuarter).append(el);
    } else if (target.id == "nextButton") {
        var newQuarter = addNext();
        $("#" + newQuarter).append(el);
    }

    // If the course has a semester restriction, warn the user
    if (courses[el.id].restrictedTo && !$(el).parent().text().startsWith(courses[el.id].restrictedTo)) {
        console.log("bad");
    }

    updatePrereqs(sibling, target);
    checkValidity();
});

// jquery after page loads
$(function () {
    // Build html elements for each of the courses
    for (var id in courses) {
        var title = (courses[id].restrictedTo ? "Restricted to: " + courses[id].restrictedTo.join(" and ") : "") + (courses[id].note ? " Note: " + courses[id].note : "");
        var html = "<div id='" + id + "' class='list-group-item' title='" + title + "'><strong>" + id + "</strong> - " + courses[id].name + "</div>";
        $("#courses").append(html);

        if (courses[id].elective) {
            $("#" + id).addClass("elective");
        }
        if (courses[id].prereqs) {
            $("#" + id).addClass("unsatisfied");
            $("#" + id).hover(function () {
                courses[this.id].prereqs.forEach(function (prereq) {
                    $("#" + prereq).addClass("prereq");
                });
            }, function () {
                courses[this.id].prereqs.forEach(function (prereq) {
                    $("#" + prereq).removeClass("prereq");
                });
            });
        }
    }

    // Hide 165
    $("#CS165").hide();

    // register all of the places courses can be dragged to with the drag/drop handler
    for (var i = 0; i < $(".dragula-container").length; dragAndDrop.containers.push($(".dragula-container")[i++]));

    // Label the initial quarter container with the current quarter
    parseLink();
    $("#Q0").prepend(getQuarterName(today));
});

// Disallow drops into a container
function removeContainer(id) {
    removedContainers.push(id);
    $(id).addClass("invalid");
    var index = dragAndDrop.containers.indexOf($(id)[0]);
    dragAndDrop.containers.splice(index, 1);
}

// Reallow drops in any containers removed due to prereqs
function restoreRemovedContainers() {
    removedContainers.forEach(function (id) {
        dragAndDrop.containers.push($(id)[0]);
        $(id).removeClass("invalid");
    });
    removedContainers = [];
}

// Get the earliest quarter a course with prereqs can be dropped into
function getCoursesEarliestQuarter(id) {
    var earliestValidQuarter = firstQuarterNum;

    // Get the earliest quarter the course can be dropped into
    courses[id].prereqs.forEach(function (prereq) {
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
    $("#quarters>.dragula-container>*").each(function () {
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
function updatePrereqs(sibling, target) {
    for (var id in courses) {
        if (courses[id].prereqs) {
            var satisfied = true;
            courses[id].prereqs.forEach(function (prereq) {
                if ($("#" + prereq).parent()[0] == $("#courses")[0]) {
                    // If this course's prereq course not been assigned to a quarter,disallow drag and drop
                    $("#" + id).addClass("unsatisfied");
                    satisfied = false;

                    // If this course had been assigned a quarter, move it back to the course bucket
                    if ($("#" + id).parent().parent()[0] == $("#quarters")[0]) {
                        if ($("#" + id).hasClass('elective')) {
                            $(target).append($("#" + id));
                        } else {
                            $("#" + prereq).after($("#" + id));
                        }
                    }
                }
            });

            // If all this course's prereqs have been assigned a quarter, allow drag and drop
            if (satisfied) $("#" + id).removeClass("unsatisfied");
        }
    }
}

function checkValidity() {
    var coreComplete = $("#courses>:not(.elective)").length <= (1 + cs165),
        hasTwoElectives = $("#quarters>.dragula-container>.elective").length >= 2,
        capstonLastQuarter = $("#quarters>.dragula-container>*").last().is("#quarters>.dragula-container>#CS467"),
        quarterRestrictions = true;

    $("#quarters>.dragula-container>*").each(function () {
        var el = this;
        if (courses[el.id].restrictedTo) {
            var courseValid = false;
            courses[el.id].restrictedTo.forEach(function (quarter) {
                if ($(el).parent().text().startsWith(quarter)) {
                    courseValid = true;
                }
            });
            if (!courseValid) {
                quarterRestrictions = false;
            }
        }
    });

    if (coreComplete && hasTwoElectives && capstonLastQuarter && quarterRestrictions) {
        $("#validText").addClass("valid");
        $("#validText").text("Your schedule is valid.")
    } else {
        $("#validText").removeClass("valid");
        $("#validText").text("Your schedule is not valid.")
    }
}

// Get the name of a quarter as a two character string and year
function getQuarterName(date) {
    return ["Winter", "Spring", "Summer", "Fall"][Math.floor(date.getMonth() / 3)] + " - " + date.getFullYear();
}

// Get the current number of quarters displayed
function getNumOfQuarters() {
    return $("#quarters>div:not(.list-group-horizontal)").length;
}

// Add a container for the next earliest quarter
function addPrev() {
    var prevQuarter = new Date(oldestQuarter.getFullYear(), oldestQuarter.getMonth() - 3),
        id = "Q" + --firstQuarterNum;

    $("#quarters>:first-child").after("<div id='" + id + "' class='dragula-container list-group-item'>" + getQuarterName(prevQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    oldestQuarter = prevQuarter;

    return id;
}

// Add a container for the next earliest quarter
function addNext() {
    var nextQuarter = new Date(newestQuarter.getFullYear(), newestQuarter.getMonth() + 3),
        id = "Q" + (getNumOfQuarters() + firstQuarterNum);

    $("#quarters>:last-child").before("<div id='" + id + "' class='dragula-container list-group-item'>" + getQuarterName(nextQuarter) + "</div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    newestQuarter = nextQuarter;

    return id;
}

// Remove the first quarter
function removePrev() {
    var nextQuarter = new Date(oldestQuarter.getFullYear(), oldestQuarter.getMonth() + 3),
        id = "Q" + firstQuarterNum;

    // Don't remove the last quarter
    if (getNumOfQuarters() != 1) {
        var index = dragAndDrop.containers.indexOf($("#" + id)[0]);
        dragAndDrop.containers.splice(index, 1);

        $("#" + id).children().each(function () {
            // Move any class in this quarter to the courses container
            // Don't need to check for electives because no electives can be in the first quarter?
            $("#courses>:first-child").after(this);
            updatePrereqs($(this), $("#courses"));
        });

        $("#" + id).remove();

        firstQuarterNum++;
        oldestQuarter = nextQuarter;

        checkValidity();
    }
}

// Remove the last quarter
function removeNext() {
    var prevQuarter = new Date(newestQuarter.getFullYear(), newestQuarter.getMonth() - 3),
        id = "Q" + (getNumOfQuarters() + firstQuarterNum - 1);

    // Don't remove the last quarter
    if (getNumOfQuarters() != 1) {
        var index = dragAndDrop.containers.indexOf($("#" + id)[0]);
        dragAndDrop.containers.splice(index, 1);

        $("#" + id).children().each(function () {
            if ($(this).hasClass('elective')) {
                $("#courses").append($(this));
            } else {
                $("#courses>:first-child").after(this);
            }
            updatePrereqs($(this), $("#courses"));
        });

        $("#" + id).remove();

        newestQuarter = prevQuarter;

        checkValidity();
    }
}

// Switch between using the cs165 option and 161/162
function toggle165() {
    if (cs165) {
        // Update prereqs
        courses.CS271.prereqs = ["CS161"];
        courses.CS352.prereqs = ["CS161"];
        courses.CS261.prereqs = ["CS162", "CS225"];
        courses.CS290.prereqs = ["CS162"];

        // Unhide new course and move it to where 161 was
        $("#CS165").after($("#CS161"));
        $("#CS161").show();
        $("#CS162").show();

        // Hide old courses and move them back to the courses tab
        $("#CS165").hide();
        $("#courses>:first-child").before($("#CS165"));

        updatePrereqs($("#CS161"), $("#CS165").parent());
        cs165 = false;
    } else {

        // Update prereqs
        courses.CS271.prereqs = ["CS165"];
        courses.CS352.prereqs = ["CS165"];
        courses.CS261.prereqs = ["CS165", "CS225"];
        courses.CS290.prereqs = ["CS165"];

        // Unhide new course and move it to where 161 was
        $("#CS161").before($("#CS165"));
        $("#CS165").show();

        // Hide old courses and move them back to the courses tab
        $("#CS161").hide();
        $("#CS162").hide();
        $("#courses>:first-child").after($("#CS162"));
        $("#courses>:first-child").before($("#CS161"));

        updatePrereqs($("#CS161"), $("#CS165").parent());
        cs165 = true;
    }
    checkValidity();
}

// Display an alert with a link to the current schedule
function alertUrl() {
    var qtr = oldestQuarter.getTime();
    var str = "?st=" + qtr;
    if (cs165) str += "&cs165=true";
    str += "&data=";
    $("#quarters>div:not(.list-group-horizontal)").each(function () {
        str += "-";
        $(this).children().each(function () {
            str += "+" + this.id;
        });
    });
    var url = "https://hschallh.github.io/cs-scheduler/" + str;
    vex.dialog.alert({
        unsafeMessage: '<b>Use this link to share your schedule:\n<a href=' + url + '>' + url + '</b>'
    });
}

// Set up a schedule based on the current link
function parseLink() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("cs165")) {
        $("#chk165").prop('checked', true);
        toggle165();
    }
    today = params.get("st") ? new Date(+params.get("st")) : new Date();
    oldestQuarter = newestQuarter = today;

    var data = params.get("data");
    if (data) {
        var quarters = data.split('-');
        quarters.shift();
        quarters.forEach(function (quarter, i) {
            var quarterId = i ? addNext() : "Q0";
            var classes = quarter.split(" ");
            classes.shift();
            classes.forEach(function (classId) {
                $("#" + quarterId).append($("#" + classId));
            });
        });
        updatePrereqs($("#courses>:first-child"), $("#courses"));
        checkValidity();
    }
}
