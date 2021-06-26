function parallax() {
    let a = document.querySelector('.hero')
    let b = document.querySelector('.img>img')
    window.onscroll = () => {
        a.style.backgroundPositionY = (window.scrollY/2) + 'px'
        b.style.transform = `translateY(${-(window.scrollY/3.5)}px)`
    }
}