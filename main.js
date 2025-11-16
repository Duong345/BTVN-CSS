const historyPopup = document.querySelector(".history-popup");
const historyButton = document.querySelector(".btn__his");
const closeButton = document.querySelector(".btn-close");
const clearButton = document.querySelector(".btn-clear");
const display = document.querySelector(".display");
const numberButtons = document.querySelectorAll(".btn__num");
const operatorButtons = document.querySelectorAll(".btn__operator");
const acButton = document.querySelector(".btn__ac");
const signButton = document.querySelector(".btn__sign");
const percentButton = document.querySelector(".btn__percent");
const pointButton = document.querySelector(".btn__point");
const resultButton = document.querySelector(".btn__result");
const historyList = document.querySelector(".history-list");
let currentNum = "";
let previousNum = "";
let history = [];
let operator = "";
let lastWasResult = false;

function saveHistory() {
  try {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  } catch (e) {}
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach((entry) => {
    const item = document.createElement("div");
    item.textContent = entry;
    historyList.appendChild(item);
  });
}

try {
  const stored = localStorage.getItem("calcHistory");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      history = parsed;
      renderHistory();
    }
  }
} catch (e) {}
historyButton.addEventListener("click", () => {
  historyPopup.style.display = "flex";
});
closeButton.addEventListener("click", () => {
  historyPopup.style.display = "none";
});
clearButton.addEventListener("click", () => {
  history = [];
  try {
    localStorage.removeItem("calcHistory");
  } catch (e) {}
  historyList.innerHTML = "";
});
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (lastWasResult && operator === "") {
      previousNum = "";
      currentNum = "";
      lastWasResult = false;
    }
    currentNum += button.textContent;
    if (operator && previousNum !== "") {
      display.textContent = `${previousNum} ${operator} ${currentNum}`;
    } else {
      display.textContent = currentNum;
    }
    display.scrollLeft = display.scrollWidth;
  });
});
if (pointButton) {
  pointButton.addEventListener("click", () => {
    if (lastWasResult && operator === "") {
      previousNum = "";
      currentNum = "";
      lastWasResult = false;
    }

    if (currentNum.includes(".")) return;

    if (currentNum === "") {
      currentNum = "0.";
    } else {
      currentNum += ".";
    }

    if (operator && previousNum !== "") {
      display.textContent = `${previousNum} ${operator} ${currentNum}`;
    } else {
      display.textContent = currentNum;
    }
    display.scrollLeft = display.scrollWidth;
  });
}
acButton.addEventListener("click", () => {
  currentNum = "";
  display.textContent = "0";
});
signButton.addEventListener("click", () => {
  if (currentNum) {
    currentNum = (-parseFloat(currentNum)).toString();
    display.textContent = currentNum;
  }
});
operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (lastWasResult) {
      previousNum = currentNum || "";
      operator = button.textContent;
      currentNum = "";
      lastWasResult = false;
      display.textContent = `${previousNum} ${operator}`;
      return;
    }

    if (currentNum === "" && previousNum === "") return;
    if (currentNum === "" && previousNum !== "") {
      operator = button.textContent;
      display.textContent = `${previousNum} ${operator}`;
      return;
    }
    previousNum = currentNum;
    operator = button.textContent;
    currentNum = "";
    display.textContent = `${previousNum} ${operator}`;
  });
});
resultButton.addEventListener("click", () => {
  if (currentNum === "" || previousNum === "" || operator === "") return;
  let prev = parseFloat(previousNum);
  let curr = parseFloat(currentNum);
  let result = 0;
  switch (operator) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      if (curr === 0) {
        return;
      }
      result = prev / curr;
      break;
    case "%":
      result = prev % curr;
      break;
    default:
      return;
  }
  display.textContent = result;
  const calc = `${previousNum} ${operator} ${currentNum} = ${result}`;
  history.push(calc);
  saveHistory();
  const item = document.createElement("div");
  item.textContent = calc;
  historyList.appendChild(item);
  previousNum = "";
  currentNum = result.toString();
  operator = "";
  lastWasResult = true;
});
