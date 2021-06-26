function showArticle(json) {
    let infos = JSON.parse(JSON.parse(json.infos))

    // article content
    document.querySelectorAll('.article-content').forEach(e => e.innerHTML = json.content)

    for(let i in infos) {
        document.querySelectorAll(`.article-${[i]}`).forEach(e => {
            e.innerText = infos[i]
        })
    }
}