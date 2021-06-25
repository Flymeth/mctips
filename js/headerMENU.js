window.addEventListener('load', () => {
    let menuBTN = document.querySelector("#menu");
    let nav = document.querySelector("nav");
    if(!menuBTN || !nav) return
    menuBTN.addEventListener("change", (e) => {
        if (e.target.checked) {
            nav.classList.add("open");
        } else {
            nav.classList.remove("open");
        }
    });
})