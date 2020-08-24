import 'bootstrap/dist/css/bootstrap.css';

/////init/////
var t = TrelloPowerUp.iframe();

var members = t.arg("members").members;
members.forEach(member => {
    var optionText = member.fullName;
    var optionValue = member.fullName;
    $('#members').append(`<option value="${optionValue}"> 
                                       ${optionText} 
                                  </option>`);
});

//TODO default date to Today ==> use of moment.js?
// $('#dateSpent').attr("value", DateTime.Today.ToString("yyyy-MM-dd"));

/////utils card/////

function addTimeToTotalSpent(value, date) {
    //TODO check if all value are set

    return new Promise((resolve) => {
        t.get('card', 'shared', 'timeTrack').then(function (data) {
            if (typeof data == 'undefined') {
                data = {
                    logs: new Array
                }
            }
            data.logs.push({
                date: date,
                timeSpent: value,
                member: $("#members").val()
            });
            t.set('card', 'shared', 'timeTrack', data).then(function () {
                resolve();
            });
        }, function (error) {
            console.log('error get timeTrack in addTimeToTotalSpent');
        });
    });
}

function calculTotalTimeSpent() {
    return new Promise((resolve) => {
        t.get('card', 'shared', 'timeTrack').then(function (data) {
            var totalTimeSpent = 0;
            if (typeof data !== 'undefined') {
                data.logs.forEach(log => {
                    totalTimeSpent += parseInt(log.timeSpent);
                });
            } else {
                data = {
                    logs: new Array
                }
            }
            resolve(totalTimeSpent);
        }, function (error) {
            console.log('error get timeTrack in calculTotalTimeSpent');
        });
    });
}

function resetData() {
    return new Promise((resolve) => {
        t.set('card', 'shared', 'timeTrack', {
            logs: new Array
        }).then(() => {
            updateDisplay();
            resolve();
        });
    });
}

function updateDisplay() {
    calculTotalTimeSpent().then((time) => {
        document.getElementById('totalTimeSpent').textContent = time;
    });

    displayLogs();
}

function displayLogs() {
    t.get('card', 'shared', 'timeTrack').then(function (data) {

        if (typeof data == 'undefined') {
            data = {
                logs: new Array
            }
        }
        $('#bodyLogTimeSpent').empty();
        data.logs.forEach(log => {
            $('#bodyLogTimeSpent').append(`<tr>
                    <td>` +
                log.member +
                `</td>
                    <td>` +
                log.date +
                `</td>
                    <td>` +
                parseInt(log.timeSpent) +
                `</td>
                </tr>`);
        });
    }, function (error) {
        console.log('error get timeTrack in displayLogs');
    });
}

/////general exec/////

document.getElementById('resetData').onclick = function () {
    resetData().then(function () {
        updateDisplay();
        // t.closeModal();
    });
}

document.getElementById('closeModal').onclick = function () {
    t.closeModal();
}

document.getElementById('insertValue').onclick = function () {
    var valTimeSpentToAdd = document.getElementById('timeSpentToAdd').value;
    var valDateSpent = document.getElementById('dateSpent').value;
    addTimeToTotalSpent(valTimeSpentToAdd, valDateSpent).then(function () {
        updateDisplay();
        // t.closeModal();
    });
}


// TODO create utils file
function escapeHTML(unsafe) {
    return ('' + unsafe)
        .replace(/&(?!amp;)/g, "&amp;")
        .replace(/<(?!lt;)/g, "&lt;")
        .replace(/>(?!gt;)/g, "&gt;")
        .replace(/"(?!quot;)/g, "&quot;")
        .replace(/'(?!#039;)/g, "&#039;");
};


/////render/////
t.render(function () {
    // NOT TRIGGERED WHEN SET DATA used, I don't know why
    // triggered only when opening

    updateDisplay();

    // var logsContainer = document.getElementById('logTimeSpent');
    // logsContainer.textContent = displayLogs(); //TODO
})