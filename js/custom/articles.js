function showArticles(result) {
    let articlesContainer = document.querySelector(".result");

    typeof result === JSON;

    let datas = result.sort((d1, d2) => d2.searchPoints - d1.searchPoints);
    let elementPrefix = "__";

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/templates/article.html");
    xhr.send();
    xhr.onload = () => {
        for (let d of datas) {
            let doc = xhr.response;

            let template = document.createElement("article");
            typeof template === XMLDocument;
            template.innerHTML = doc;

            for (let e in d) {
                let docString = template.innerHTML.split(elementPrefix + e);
                let elements = template.querySelectorAll(
                    `.${elementPrefix}${e}`
                );

                if (elements.length > 0) {
                    elements.forEach((el) => {
                        el.innerText = "(" + d[e] + ")";
                    });
                } else if (docString.length > 1) {
                    template.innerHTML = docString.join(d[e]);
                }
            }

            // check if element with "src" attribute has a src content
            let src = template.querySelectorAll("*[src]");
            if (src.length > 0) {
                src.forEach((s) => {
                    let url = new URL(s.src);
                    let needDel = url.pathname.startsWith("/" + elementPrefix);
                    if (needDel) {
                        s.parentElement.removeChild(s);
                    }
                });
            }

            articlesContainer.appendChild(template);
        }
    };
}
