//PAGE LOAD AND UNLOAD
document.addEventListener('DOMContentLoaded', function() {
    entryForm.style.display = "none";
    LoadFormData();
    ToggleGoalForm();
});

window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
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

    ToggleGoalForm();
    SaveFormData();
})


let entryForm = document.getElementById('work-entry');
let entryFormData = new FormData(entryForm);
let entries = [];
entryForm.addEventListener('submit', function (event) {
    event.preventDefault();
    entryFormData = new FormData(entryForm);

    const newEntry = document.createElement('div');
    const entryName = document.createElement('p');
    const entryHours = document.createElement('p');
    const entryObject = GetFormObject(entryFormData);

    entryName.textContent = entryObject.entrytitle;
    entryHours.textContent = `${entryObject.timeentry}h ${entryObject.timeminutes}m`;

    newEntry.appendChild(entryName);
    newEntry.appendChild(entryHours);

    document.body.appendChild(newEntry);
    entries.push(newEntry);
    console.log(entries);
    ToggleEntryForm();
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
            form.style.display = "block";
        }
        else {
            form.style.display = "none";
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


//SAVING AND LOADING
function SaveFormData() {
    if (formData != undefined) {
        localStorage.setItem('goal', JSON.stringify(GetFormObject(formData)));
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

function ResetPage() {
    localStorage.clear();
    formData = undefined;
    ToggleGoalForm();
    entries.forEach(entry => {
        document.body.removeChild(entry);
    })
}
