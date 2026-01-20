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
const form = document.getElementById('goal-entry');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    console.log(formObject.goaltime);
})


const entryForm = document.getElementById('work-entry');

entryForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(entryForm);
    const formObject = Object.fromEntries(formData.entries());
    console.log(formObject.timeentry);
})
