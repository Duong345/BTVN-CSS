document.addEventListener("DOMContentLoaded", () => {
  const inputList = document.querySelector(".input-list");
  const addBtn = document.querySelector(".add-btn");
  const logBtn = document.querySelector(".log-btn");
  addBtn.addEventListener("click", () => {
    const currentCount = inputList.querySelectorAll("input").length;
    const newIndex = currentCount + 1;
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-wrapper");
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.name = "phone-number";
    newInput.placeholder = `${newIndex - 1} `;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "x";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => {
      wrapper.remove();
    });
    wrapper.appendChild(newInput);
    wrapper.appendChild(removeBtn);
    inputList.appendChild(wrapper);
  });

  logBtn.addEventListener("click", () => {
    const inputs = inputList.querySelectorAll("input[name='phone-number']");
    inputs.forEach((input, index) => {
      console.log(`{ ${index} }; { ${input.value} }`);
    });
  });
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.remove();
    });
  });
});
