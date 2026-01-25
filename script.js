//GLOBAL VARS
let timeWorkedHours = 0;
let timeWorkedMinutes = 0;
let goalTimeHours = 0;
let goalTimeMinutes = 0;
let dailyTimes = [0, 0, 0, 0, 0, 0, 0];
const colors = ["#BB6BD9", "#F2C94C", "#6FCF97", "#56CCF2", "#9B51E0", "#EB5757", "#F2994A"];
let color = GetColor();
let sundayReset = false;

//PAGE LOAD AND UNLOAD
document.addEventListener('DOMContentLoaded', function() {
    LoadSundayReset();
    if (GetDate(false) == 0 && !sundayReset) {
        ResetPage();
        sundayReset = true;
    }
    else if (GetDate(false != 0)) {
        sundayReset = false;
    }
    LoadFormData();
    LoadEntries();
    LoadTime();
    dataChart.data.datasets[0].data = dailyTimes;
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
    SaveSundayReset();
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

function GetColor() {
    return colors[GetDate(false)];
}

//THEME HANDLING
function ChangeTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');

    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    root.setAttribute('data-theme', nextTheme);
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

    const entryObject = { timeHours: formObject.timeentry, timeMinutes: formObject.timeminutes, day: GetDate(false) }; 

    AppendEntry(entryObject);
    entries.push(entryObject);
    SaveEntries();
    ToggleEntryForm();
    const hours = Number(entryObject.timeHours);
    const minutes = Number(entryObject.timeMinutes);

    timeWorkedMinutes += minutes + (hours * 60);
    const day = entryObject.day;
    dailyTimes[day] += (minutes + (hours * 60)) / 60;

    UpdateProgressPercent();
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
        if (formData == undefined) {
            form.className = "goal-entry-visible";
        }
        else {
            form.className = "goal-entry-hidden";
        }

    }
}

function ToggleEntryForm() {
    console.log(entryForm.className)
    if (entryForm.className == "work-entry-visible") {
        entryForm.className = "work-entry-hidden";
    }
    else if (entryForm.className == "work-entry-hidden"){
        entryForm.className = "work-entry-visible";
    }
}

function AppendEntry(entry) {
    const newDiv = document.createElement('div');
    const newTime = document.createElement('p');
    const newButton = document.createElement('button');
    const workEntries = document.querySelector('#work-entries');

    newDiv.className = "entry";
    newTime.textContent = `${entry.timeHours}h, ${entry.timeMinutes}m`
    newButton.textContent = "Trash";
    newDiv.style.backgroundColor = colors[entry.day];

    newButton.onclick = function() {
        workEntries.removeChild(newDiv);
        const index = entries.indexOf(entry);

        if (index > -1) {
            entries.splice(index, 1);
        }
        const hours = Number(entry.timeHours);
        const minutes = Number(entry.timeMinutes);
        timeWorkedMinutes -= minutes + (hours * 60);
        const removedMinutes = Number(entry.timeMinutes) + (Number(entry.timeHours) * 60);
        dailyTimes[entry.day] -= removedMinutes / 60;
        SaveTime();

        dataChart.update();
        UpdateProgressPercent();
        SaveEntries();
    }

    newDiv.appendChild(newTime);
    newDiv.appendChild(newButton);
    workEntries.appendChild(newDiv);
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
        else {
            incentiveText.style.display = "none";
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
    
    const currentEntries = document.querySelectorAll('.entry');

    if (currentEntries.length > 0) {
        localStorage.setItem('dailyTimes', JSON.stringify(dailyTimes));
    }
    else {
        dailyTimes = [0, 0, 0, 0, 0, 0, 0];
        localStorage.setItem('dailyTimes', JSON.stringify(dailyTimes));
    }
    dataChart.update();
}

function LoadTime() {
    goalTimeMinutes = JSON.parse(localStorage.getItem('goalTime'));
    timeWorkedMinutes = JSON.parse(localStorage.getItem('progressTime'));
    stored = JSON.parse(localStorage.getItem('dailyTimes')) || [0, 0, 0, 0, 0, 0, 0];
    if (stored) {
        dailyTimes.length = 0;
        dailyTimes.push(...stored);
    }
    dataChart.update();
}

function ResetPage() {
    localStorage.clear();
    formData = undefined;
    ToggleGoalForm();
    ToggleProgressBar();
    const entryNodes = document.querySelectorAll('.entry');
    const entryParent = document.querySelector('#work-entries');
    entryNodes.forEach(entry => {
        entryParent.removeChild(entry);
    })
    entries = [];
    timeWorkedMinutes = 0;
    timeWorkedHours = 0;
    dailyTimes = [0, 0, 0, 0, 0, 0, 0];
    goalTimeMinutes = 0;
    goalTimeHours = 0;
    dataChart.data.datasets[0].data = dailyTimes;
    dataChart.update();
}

function SaveSundayReset() {
    localStorage.setItem('sundayreset', JSON.stringify(sundayReset));
}
function LoadSundayReset() {
    sundayReset = JSON.parse(localStorage.getItem('sundayreset'));
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
            borderWidth: 1,
            backgroundColor: colors,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

window.addEventListener('resize', () => {
    dataChart.resize();
})
