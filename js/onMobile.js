let Mobile = navigator.userAgent.includes('Mobile')
if(Mobile) {
    document.body.classList.add("mobile")
}else {
    document.body.classList.add("pc")
}