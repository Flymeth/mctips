let menuBTN = document.querySelector("#menu");
let nav = document.querySelector("nav");
menuBTN.addEventListener("change", (e) => {
    if (e.target.checked) {
        nav.classList.add("open");
    } else {
        nav.classList.remove("open");
    }
});