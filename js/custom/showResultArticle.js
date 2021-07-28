function showArticles(result) {
    let articlesContainer = document.querySelector(".result");

    typeof result === JSON;

    let datas = result.sort((d1, d2) => d2.points - d1.points);
    let elementPrefix = "__";

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/templates/article.html");
    xhr.send();
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== 4) return;
        for(let d of datas) {
            let template = document.createElement("article")
            template.innerHTML = xhr.response;

            for (let e in d.article) {
                template.querySelectorAll('*[data-text=' + e + "]").forEach(element => element.innerText = d.article[e])
                template.querySelectorAll('*[data-src=' + e + "]").forEach(element => element.src = d.article[e])
                template.innerHTML = template.innerHTML.split(elementPrefix + e).join(d.article[e])   
            }

            template.querySelectorAll('*[src]').forEach(element => {
                let url = new URL(element.src)
                if(url.pathname.startsWith('/' + elementPrefix)) {
                    element.parentElement.removeChild(element)
                }
            })

            articlesContainer.appendChild(template);
        }
    };
}
