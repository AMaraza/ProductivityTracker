//PAGE LOAD AND UNLOAD
document.addEventListener('DOMContentLoaded', function() {
    entryForm.style.display = "none";
    LoadFormData();
    LoadEntries();
    ToggleGoalForm();
});

window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    SaveEntries();
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
    const formObject = GetFormObject(entryFormData);

    const entryObject = { title: formObject.entrytitle, description: formObject.description, timeHours: formObject.timeentry, timeMinutes: formObject.timeminutes }; 

    AppendEntry(entryObject);
    entries.push(entryObject);
    SaveEntries();
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

function AppendEntry(entry) {
    const newDiv = document.createElement('div');
    const newName = document.createElement('p');
    const newTime = document.createElement('p');

    newName.textContent = entry.title;
    newTime.textContent = `${entry.timeHours}h, ${entry.timeMinutes}m`
    newDiv.appendChild(newName);
    newDiv.appendChild(newTime);
    document.body.appendChild(newDiv);
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
}

function LoadEntries() {
    if (localStorage.getItem('entries') != null) {
        const storedEntries = localStorage.getItem('entries');
        const restoredEntries = JSON.parse(storedEntries);
        restoredEntries.forEach(entry => {
            AppendEntry(entry);
        })
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
}
