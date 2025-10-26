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
const resultButton = document.querySelector(".btn__result");
const historyList = document.querySelector(".history-list");
let currentNum = "";
let previousNum = "";
let history = [];
let operator = "";
historyButton.addEventListener("click", () => {
  historyPopup.style.display = "flex";
});
closeButton.addEventListener("click", () => {
  historyPopup.style.display = "none";
});
clearButton.addEventListener("click", () => {
  history = [];
  const historyList = document.querySelector(".history-list");
  historyList.innerHTML = "";
});
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentNum += button.textContent;
    display.textContent = currentNum;
  });
});
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
    if (currentNum === "") return;
    previousNum = currentNum;
    operator = button.textContent;
    currentNum = "";
    display.textContent = operator;
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
  const item = document.createElement("div");
  item.textContent = calc;
  historyList.appendChild(item);
  previousNum = "";
  currentNum = result.toString();
  operator = "";
});
