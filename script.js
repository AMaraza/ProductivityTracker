//GLOBAL VARS
let timeWorkedHours = 0;
let timeWorkedMinutes = 0;
let goalTimeHours = 0;
let goalTimeMinutes = 0;
let dailyTimes = [0, 0, 0, 0, 0, 0, 0];

//PAGE LOAD AND UNLOAD
document.addEventListener('DOMContentLoaded', function() {
    entryForm.style.display = "none";
    if (GetDate(false) == 0) {
        ResetPage();
    }
    LoadFormData();
    LoadEntries();
    LoadTime();
    ToggleGoalForm();
    ToggleProgressBar();
    UpdateProgressPercent();
    const daysText = document.querySelector('#days-left');
    const daysLeft = 6 - GetDate(false);
    if (daysLeft == 1) {
        daysText.textContent = `There is 1 day left in the week!`;
    }
    else {
        daysText.textContent = `There are ${daysLeft} days left in the week!`;
    }
    dataChart.update();
});

window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    SaveEntries();
    SaveTime();
})

//DATE HANDLING
function GetDate(needString) {
    const today = new Date();
    if (needString) {
        const options = { weekday: 'long' };
        return today.toLocaleDateString(undefined, options);
    }
    else {
        return today.getDay();
    }
}


//FORM HANDLING
let form = document.getElementById('goal-entry');
let formData = undefined;

form.addEventListener('submit', function (event) {
    formData = new FormData(form);
    event.preventDefault();

    const formObject = GetFormObject(formData);
    const hours = Number(formObject.goaltime);
    const minutes = Number(formObject.goalminutes);

    goalTimeMinutes = ((hours * 60) + minutes);

    console.log(formObject);
    
    ToggleGoalForm();
    ToggleProgressBar();
    SaveFormData();
    UpdateProgressPercent();
})


let entryForm = document.getElementById('work-entry');
let entryFormData = new FormData(entryForm);
let entries = [];
entryForm.addEventListener('submit', function (event) {
    event.preventDefault();
    entryFormData = new FormData(entryForm);
    const formObject = GetFormObject(entryFormData);

    const entryObject = { title: formObject.entrytitle, description: formObject.description, timeHours: formObject.timeentry, timeMinutes: formObject.timeminutes }; 

    AppendEntry(entryObject);
    entries.push(entryObject);
    SaveEntries();
    ToggleEntryForm();
    const hours = Number(entryObject.timeHours);
    const minutes = Number(entryObject.timeMinutes);

    timeWorkedMinutes += minutes + (hours * 60);
    if (timeWorkedMinutes > 0) {
        UpdateProgressPercent();
        dailyTimes[GetDate(false)] = (timeWorkedMinutes / 60);
    }
    else {
        dailyTimes[GetDate(false)] = 0;
    }

    dataChart.update();
    SaveTime();
})

function GetFormObject(formData) {
    if (formData != undefined) {
        const formObject = Object.fromEntries(formData.entries());
        return formObject;
    }
}

function ToggleGoalForm() {
    if (form != null) {
        if (GetDate(false) == 0 || formData == undefined) {
            form.className = "goal-entry-visible";
        }
        else {
            form.className = "goal-entry-hidden";
        }

    }
}

function ToggleEntryForm() {
    if (entryForm.style.display == "none") {
        entryForm.style.display = "block";
    }
    else if (entryForm.style.display == "block"){
        entryForm.style.display = "none";
    }
}

function AppendEntry(entry) {
    const newDiv = document.createElement('div');
    const newName = document.createElement('p');
    const newTime = document.createElement('p');
    const newButton = document.createElement('button');

    newName.textContent = entry.title;
    newTime.textContent = `${entry.timeHours}h, ${entry.timeMinutes}m`
    newButton.textContent = "Trash";

    newButton.onclick = function() {
        document.body.removeChild(newDiv);
        const index = entries.indexOf(entry);

        if (index > -1) {
            entries.splice(index, 1);
        }
        const hours = Number(entry.timeHours);
        const minutes = Number(entry.timeMinutes);
        timeWorkedMinutes -= minutes + (hours * 60);
        dailyTimes[GetDate(false)] = (timeWorkedMinutes / 60);
        dataChart.update();
        UpdateProgressPercent();
        SaveEntries();
    }

    newDiv.appendChild(newName);
    newDiv.appendChild(newTime);
    newDiv.appendChild(newButton);
    document.body.appendChild(newDiv);
}

//PROGRESS BAR
function ToggleProgressBar() {
    const progressBar = document.querySelector('#goal-progress');
    const goalEntryText = document.querySelector('#goal-entry-text');
    const progressText = document.querySelector('#current-progress');
    const timeText = document.querySelector('#time-left');
    const incentiveText = document.querySelector('#incentive-text');
    const formObject = GetFormObject(formData);

    if (form.className == "goal-entry-visible") {
        progressBar.style.display = "none";
        progressText.style.display = "none";
        timeText.style.display = "none";
        goalEntryText.textContent = "You have not yet entered a goal for this week!"
        incentiveText.style.display = "none";
    }
    else {
        progressBar.style.display = "inline-block";
        progressText.style.display = "inline-block";
        timeText.style.display = "inline-block";
        goalEntryText.textContent = "Your Current Goal Progress";
        if (formObject.projectname.length > 0) {
            goalEntryText.textContent = `Current ${formObject.projectname} Progress`
        }
        if (formObject.incentiveinput.length > 0) {
            incentiveText.style.display = "block";
            incentiveText.textContent = `What you're working towards: ${formObject.incentiveinput}`;
            console.log(formObject.incentiveinput)
        }
    }
}

function UpdateProgressPercent() {
    const progressBar = document.querySelector('#goal-progress');
    const progressText = document.querySelector('#current-progress');
    const timeText = document.querySelector('#time-left');

    progressText.textContent = `${progressBar.value}%`;

    const remainingMinutes = goalTimeMinutes - timeWorkedMinutes;
    console.log(remainingMinutes);
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    
    const goalMinutesNum = Number(goalTimeMinutes);
    const workMinutesNum = Number(timeWorkedMinutes);
    const percentage = Math.floor((workMinutesNum / goalMinutesNum) * 100);

    if (remainingMinutes > 0) {
        timeText.textContent = `${hours}h ${minutes}m Remaining`
        progressText.textContent = `${percentage}%`;
        progressBar.value = percentage;
    }
    else {
        timeText.textContent = `0h 0m Remaining`
        progressText.textContent = `100%`;
        progressBar.value = 100;
    }

}

//SAVING AND LOADING
function SaveFormData() {
    if (formData != undefined) {
        localStorage.setItem('goal', JSON.stringify(GetFormObject(formData)));
    }
}

function SaveEntries() {
    if (entries.length > 0) {
        localStorage.setItem('entries', JSON.stringify(entries));
    }    
    else {
        localStorage.setItem('entries', null);
    }
}

function LoadEntries() {
    if (localStorage.getItem('entries') != null) {
        const storedEntries = localStorage.getItem('entries');
        const restoredEntries = JSON.parse(storedEntries);
        if (restoredEntries != null) {
            restoredEntries.forEach(entry => {
                entries.push(entry);
                AppendEntry(entry);
            })
        }
    }
}

function LoadFormData() {
    if (localStorage.getItem('goal') != "undefined" && localStorage.getItem('goal') != null) {
        const loadFormObject = JSON.parse(localStorage.getItem('goal'));
        formData = new FormData();
        Object.entries(loadFormObject).forEach(([key, value]) => {
            formData.append(key, value);
        })
        console.log(formData);
    }
    else {
        formData = undefined;
    }
}

function SaveTime() {
    localStorage.setItem('goalTime', JSON.stringify(goalTimeMinutes))
    localStorage.setItem('progressTime', JSON.stringify(timeWorkedMinutes));
    localStorage.setItem('dailyTimes', JSON.stringify(dailyTimes));
}

function LoadTime() {
    goalTimeMinutes = JSON.parse(localStorage.getItem('goalTime'));
    timeWorkedMinutes = JSON.parse(localStorage.getItem('progressTime'));
    dailyTimes = JSON.parse(localStorage.getItem('dailyTimes'));
    dataChart.data.datasets[0].data = dailyTimes;
    dataChart.update();
}

function ResetPage() {
    localStorage.clear();
    formData = undefined;
    ToggleGoalForm();
    ToggleProgressBar();
    entries = [];
    timeWorkedMinutes = 0;
    timeWorkedHours = 0;
    dailyTimes = [0, 0, 0, 0, 0, 0, 0];
    goalTimeMinutes = 0;
    goalTimeHours = 0;
}

//BAR CHART WITH CHART.JS
const ctx = document.getElementById('bar-graph');

const dataChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        datasets: [{
            label: 'Hours Worked',
            data: dailyTimes,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
