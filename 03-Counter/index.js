// Counter Studio — JavaScript
// Created by Faisal Ahmed | Web Developer

// 1. Select the HTML elements that JavaScript needs to control.
const countValue = document.querySelector("#countValue");
const countCaption = document.querySelector("#countCaption");
const decreaseButton = document.querySelector("#decreaseButton");
const increaseButton = document.querySelector("#increaseButton");
const resetButton = document.querySelector("#resetButton");
const yearElement = document.querySelector("#year");

// 2. Store the counter's current value in a variable.
let count = 0;

// 3. Update the number and its supporting message on the page.
function updateCounter() {
    countValue.textContent = count;

    // Use a different color to make negative and positive values easier to notice.
    countValue.classList.toggle("is-positive", count > 0);
    countValue.classList.toggle("is-negative", count < 0);

    if (count === 0) {
        countCaption.textContent = "Ready when you are";
    } else if (count > 0) {
        countCaption.textContent = `${count} ${count === 1 ? "step" : "steps"} above zero`;
    } else {
        countCaption.textContent = `${Math.abs(count)} ${Math.abs(count) === 1 ? "step" : "steps"} below zero`;
    }
}

// 4. Increase the value by one when Increase is clicked.
increaseButton.addEventListener("click", function () {
    count += 1;
    updateCounter();
});

// 5. Decrease the value by one when Decrease is clicked.
decreaseButton.addEventListener("click", function () {
    count -= 1;
    updateCounter();
});

// 6. Return the value to zero when Reset is clicked.
resetButton.addEventListener("click", function () {
    count = 0;
    updateCounter();
});

// 7. Add keyboard shortcuts for quick interaction.
document.addEventListener("keydown", function (event) {
    // Don't trigger shortcuts when the user is typing in a form field.
    if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
    ) {
        return;
    }

    if (event.key === "+" || event.key === "=" || event.key === "ArrowUp") {
        count += 1;
        updateCounter();
    } else if (event.key === "-" || event.key === "ArrowDown") {
        count -= 1;
        updateCounter();
    } else if (event.key === "0" || event.key.toLowerCase() === "r") {
        count = 0;
        updateCounter();
    }
});

// 8. Keep the footer year current automatically.
yearElement.textContent = new Date().getFullYear();

// 9. Render the initial counter state when the page loads.
updateCounter();
