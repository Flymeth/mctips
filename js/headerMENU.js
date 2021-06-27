window.addEventListener('load', () => {
    let menuBTN = document.querySelector("#menu");
    let header = document.querySelector("header");
    if(!menuBTN || !header) return
    menuBTN.addEventListener("change", (e) => {
        if (e.target.checked) {
            header.classList.add("open");
            if(Mobile) {
                document.body.classList.add('noscroll')
            }
        } else {
            header.classList.remove("open");
            if(Mobile) {
                document.body.classList.remove('noscroll')
            }
        }
    });
})