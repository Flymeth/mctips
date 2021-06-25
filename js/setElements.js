let templates = {
    "header": header,
    "footer": footer
}

let blockedElementsMETA = document.querySelector('meta[name=block_templates]')
let blockedElements;
if(blockedElementsMETA) {
    blockedElements = blockedElementsMETA.content.toString().split(' ').join('').split(';')
}

function setElements() {
    for(let i in templates) {
        if(blockedElements) {
            for(let blocked of blockedElements) {
                if(templates[i].name === blocked) continue
                templates[i].call(this)
            }
        }else {
            templates[i].call(this)
        }
    }
}
setElements()

function header() {
    let pageTitle = document.querySelector('meta[name=title]').content
    
    let titleSelector = ".page-title"
    
    let xhr = new XMLHttpRequest()
    xhr.open('GET','/templates/header.html')
    xhr.send()
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
            let addTo = document.querySelector('main')
            let responseText = xhr.response
            addTo.innerHTML = responseText + addTo.innerHTML
            try {
                document.querySelector(titleSelector).innerText = pageTitle
            } catch (e) {}
        }
    }
}

function footer() {    
    let xhr = new XMLHttpRequest()
    xhr.open('GET','/templates/footer.html')
    xhr.send()
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
            let responseText = xhr.response
            document.body.innerHTML += responseText
        }
    }
}