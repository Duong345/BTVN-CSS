document.addEventListener("DOMContentLoaded", () => {
  const inputList = document.querySelector(".input-list");
  const addBtn = document.querySelector(".add-btn");
  const logBtn = document.querySelector(".log-btn");
  addBtn.addEventListener("click", () => {
    const currentCount = inputList.querySelectorAll("input").length;
    const newIndex = currentCount + 1;

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.name = "phone-number";
    newInput.placeholder = `${newIndex - 1} `;

    inputList.appendChild(newInput);
  });

  logBtn.addEventListener("click", () => {
    const inputs = inputList.querySelectorAll("input[name='phone-number']");
    console.clear();
    console.log("All typed phone numbers:");
    inputs.forEach((input, index) => {
      console.log(`{ ${index + 1} }; { ${input.value} }`);
    });
  });
});
