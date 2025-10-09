const group = document.querySelector(".button-group");
const addBtn = document.querySelector(".add-btn");
const logBtn = document.querySelector(".log-btn");
const input = document.querySelector('input[name="phone-number"]');
addBtn.addEventListener("click", () => {
  const p = document.createElement("p");
  const now = new Date().toLocaleDateString();
  p.textContent = `Hello world + ${now}`;
  group.insertBefore(p, addBtn.nextElementSibling);
});
logBtn.addEventListener("click", () => {
  const phoneNumber = input.value;
  if (phoneNumber === "") {
    alert("phone number undefined");
  } else {
    console.log("phone number:", phoneNumber);
  }
});
