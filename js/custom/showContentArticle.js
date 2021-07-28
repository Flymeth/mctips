function showArticle(article) {
    for(let i in article) {
        console.log(i);
        document.querySelectorAll(`.article-${[i]}`).forEach(e => {
            e.innerHTML = article[i]
        })
    }
}