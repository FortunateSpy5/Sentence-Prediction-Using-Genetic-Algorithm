let sliders = document.querySelectorAll(".slider");
let values = document.querySelectorAll(".value");

values[0].innerHTML = sliders[0].value * 10;
sliders[0].oninput = function () {
  values[0].innerHTML = sliders[0].value * 10;
};

values[1].innerHTML = sliders[1].value;
sliders[1].oninput = function () {
  values[1].innerHTML = sliders[1].value;
};

values[2].innerHTML = sliders[2].value;
sliders[2].oninput = function () {
  values[2].innerHTML = sliders[2].value;
};