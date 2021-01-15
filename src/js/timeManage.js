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
        await Promise((resolve) => {
            data.logs.push({
                date: date,
                timeSpent: value,
                member: member
            });
            resolve();
        });
    } catch (e) {
        console.error("Error - addTimeToTotalSpent - get card data - " + e.message);
    }

    try {
        await t.set('card', 'shared', 'timeTrack', data);
    } catch (e) {
        console.error("Error - addTimeToTotalSpent - get set data - " + e.message);
    }
}

async function calculateTotalTimeSpent() {
    let data = await t.get('card', 'shared', 'timeTrack');
    return data ? data.logs.reduce((acc, log) => acc + parseInt(log.timeSpent, 10), 0) : 0;
}

async function resetData() {
    await t.set('card', 'shared', 'timeTrack', {
        logs: new Array
    });
    await updateDisplay();
}

async function updateDisplay() {
    var time = await calculateTotalTimeSpent();

    document.getElementById('totalTimeSpent').textContent = time;

    displayLogs();
}

async function displayLogs() {
    var data = await t.get('card', 'shared', 'timeTrack');
    if (typeof data == 'undefined') {
        console.log('No log found on this card.');
        return;
    }
    $('#bodyLogTimeSpent').empty();
    data.logs.forEach(log => {
        $('#bodyLogTimeSpent').append(
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