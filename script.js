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
    // TODO: Headers in containers still move within container
    invalid: function(el, handle) {
        return el.tagName != "DIV";
    }
});

// jquery after page loads
$(function() {

    // Label the initial quarter container with the current quarter
    $("#Q0").append("<h3>" + getQuarter(today) + " - " + today.getFullYear() + "</h3>");

    // Add all of the places courses can be dragged to the drag and drop containers
    for (var i = 0; i < $(".container").length; dragAndDrop.containers.push($(".container")[i++]));
});

// Get the quarter abreviation that corrosponds to the month in the given date
function getQuarter(date) { return ["Wi", "Sp", "Su", "Fa"][Math.floor(date.getMonth() / 3)]; }

// Get the current number of quarters displayed
function getNumOfQuarters() { return $("#quarters>div").length; }

// Add the next earliest quarter
function addPrev() {
    var prevQuarter = new Date(oldestQuarter.getFullYear(), oldestQuarter.getMonth() - 3),
        id = "Q" + --firstQuarterNum;

    $("#prevButton").after("<div id='" + id + "' class='container'><h3>" + getQuarter(prevQuarter) + " - " + prevQuarter.getFullYear() + "</h3></div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    oldestQuarter = prevQuarter;
}

// Add the next latest quarter
function addNext() {
    var nextQuarter = new Date(newestQuarter.getFullYear(), newestQuarter.getMonth() + 3),
        id = "Q" + (getNumOfQuarters() + firstQuarterNum);

    $("#nextButton").before("<div id='" + id + "' class='container'><h3>" + getQuarter(nextQuarter) + " - " + nextQuarter.getFullYear() + "</h3></div>");
    dragAndDrop.containers.push($("#" + id)[0]);

    newestQuarter = nextQuarter;
}