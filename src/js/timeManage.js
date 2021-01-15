import 'bootstrap/dist/css/bootstrap.css';

import DOMPurify from 'dompurify';

/////init/////
var t = TrelloPowerUp.iframe();

var members = t.arg("members").members;
members.forEach(member => {
    var optionText = DOMPurify.sanitize(member.fullName);
    var optionValue = DOMPurify.sanitize(member.fullName);
    $('#members').append(`<option value="${optionValue}"> 
                                       ${optionText} 
                                  </option>`);
});

//TODO default date to Today ==> use of moment.js?
// $('#dateSpent').attr("value", DateTime.Today.ToString("yyyy-MM-dd"));

/////utils card/////

async function addTimeToTotalSpent(value, date, member) {
    try {
        let data = await t.get('card', 'shared', 'timeTrack');
        await Promise.all(
            data.logs.push({
                date: date,
                timeSpent: value,
                member: member
            })
        );
    } catch (e) {
        console.error("Error - addTimeToTotalSpent - get card data - " + e.message);
    }

    try {
        await t.set('card', 'shared', 'timeTrack', data);
    } catch (e) {
        console.error("Error - addTimeToTotalSpent - get set data - " + e.message);
    }
}

// function addTimeToTotalSpent(value, date, member) {
//     return new Promise((resolve) => {
//         t.get('card', 'shared', 'timeTrack').then(function (data) {
//             if (typeof data == 'undefined') {
//                 data = {
//                     logs: new Array
//                 }
//             }
//             
//             t.set('card', 'shared', 'timeTrack', data).then(function () {
//                 resolve();
//             });
//         }, function (error) {
//             console.log('error get timeTrack in addTimeToTotalSpent');
//         });
//     });
// }

async function calculateTotalTimeSpent() {
    let data = await t.get('card', 'shared', 'timeTrack');
    return data ? data.logs.reduce((acc, log) => acc + parseInt(log.timeSpent, 10), 0) : 0;
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
    calculateTotalTimeSpent().then((time) => {
        console.log("calculateTotalTimeSpent result : " + time);
        document.getElementById('totalTimeSpent').textContent = time;
    });

    displayLogs();
}

function displayLogs() {
    t.get('card', 'shared', 'timeTrack').then(function (data) {

        if (typeof data == 'undefined') {
            console.log('No log found on this card.');
            return;
        }
        console.log("displayLogs - data get card TimeTrack :", data);
        data.logs.forEach(log => {
            var logBody = document.createElement("div");
            logBody.append(
                `<tr>
                    <td>` +
                        log.member +
                    `</td>
                    <td>` +
                        log.date +
                    `</td>
                    <td>` +
                        parseInt(log.timeSpent) +
                    `</td>
                </tr>`
            );
        });
        $('#bodyLogTimeSpent').html(logBody);
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
    //check data eligibility --> timeSpentToAdd = number, dateSpent = date
    var valTimeSpentToAdd = DOMPurify.sanitize(document.getElementById('timeSpentToAdd').value);
    var valDateSpent = DOMPurify.sanitize(document.getElementById('dateSpent').value);
    var valMember = $("#members").val();
    if (valTimeSpentToAdd !== "" && valDateSpent !== "" && valMember) {
        addTimeToTotalSpent(valTimeSpentToAdd, valDateSpent, valMember).then(function () {
            updateDisplay();
        });
    }
}


/////render/////
t.render(function () {
    // NOT TRIGGERED WHEN SET DATA used, I don't know why
    // triggered only when opening

    updateDisplay();
})