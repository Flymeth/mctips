let server = require('http')
let fs = require('fs')
let url = require('url')
let marked = require('marked')
let configs = require('./configs.json')

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

let srv = server.createServer(options).listen(configs.port).on('listening', () => {
  console.log('listen on port ' + srv.address().port);
})

srv.on('request', (req, res) => {
  let reqByUser = req.headers['sec-fetch-mode'] === "navigate" || req.headers['sec-fetch-user'] === "?1" || req.headers['upgrade-insecure-requests']

  let reqURL = ('http://'+req.headers.host).split('http://').join('http://') + req.url

  let urlInfos = url.parse(decodeURI(reqURL))

  let prevent = urlInfos.query ? urlInfos.query.split(' ').join('').split('&').find(e => e.split('=')[0] === configs.query.prevent) : undefined

  console.log(reqByUser);
  if(!reqByUser || prevent) {
    if(urlInfos.path === '/') return goIndex()
    let accept = req.headers.accept ? req.headers.accept.split(',').find(t => t.includes(urlInfos.pathname.split('.')[1])) : null
    return fs.readFile('.' + urlInfos.pathname, (err, f) => {
      if(err) return res.end(err.toString())
      if(accept) {
        res.setHeader('Content-Type', accept)
      }
      res.end(f)
    })
  }

  // new

  if(urlInfos.query) {
    var q = {}
    for(let query of urlInfos.query.split('&')) {
      let splited = query.split('=')
      q[decodeURI(splited[0]).toLowerCase().split(' ').join('_')] = decodeURI(splited[1]).split(' ').join('+').split('+')
    }
  }

  const pageInformations = {
    page: urlInfos.pathname,
    query: q
  }

  console.log(pageInformations);

  switch (pageInformations.page.toLowerCase()) {

    // search for articles
    case "/search":
      // if there is not query keys
      if(!pageInformations.query) return goIndex()
      let keys = pageInformations.query[configs.query.querySearch]
      let versions = pageInformations.query[configs.query.queryVersion]
      let types = pageInformations.query[configs.query.queryType]
      if(!keys && !versions && !types) return goIndex()
      if(!keys || keys.join('') === '__all') keys = ['']

      // find folders
      let folders = []
      if(pageInformations.query[configs.query.queryType]) {
        folders = pageInformations.query[configs.query.queryType]
      }else {
        folders = fs.readdirSync(configs.main_path)
      }

      // find articles (in the folders)
      let articles = {}
      for(let folder of folders) {
        try {
          articles[folder] = fs.readdirSync(configs.main_path + folder)
        } catch (e) {}
      }

      // find articles that match with the query keys
      let foundArticles = []
      for(let domain in articles) {
        for(let article of articles[domain]) {
          try {
            var fileContent = fs.readFileSync(configs.main_path + domain + '/' + article, {encoding: 'utf-8'}).toString()
          } catch (err) {}

          var articleInformations = getArticleInformations(fileContent.toString(), domain, article)
          if(!articleInformations) continue
          delete articleInformations.content

          if(keys.join('') === configs.prefix_show_all_articles) foundArticles[configs.main_path + domain + '/' + article] = {points: 0, article: articleInformations}
          else {
            let points = 0
            for(let info in articleInformations) {
              for(let key of keys) {
                if(articleInformations[info].toLowerCase().includes(key.toLowerCase())) {
                  if(configs.points[info]) {
                    points+=configs.points[info]
                  }
                }
              }
            }

            if(points) {
              foundArticles.push({
                path: configs.main_path + domain + '/' + article,
                points: points,
                article: articleInformations
              })
            }
          }
        }

        if(foundArticles) {

          if(versions) {
            for(let art in foundArticles) {
              let needDelete = true
              for(let version of versions) {
                if(foundArticles[art].article.version && foundArticles[art].article.version.startsWith(version)) {
                  needDelete = false
                }
              }

              if(needDelete) foundArticles.splice(art)
            }
          }
  
          if(types) {
            for(let art in foundArticles) {
              for(let type of types) {
                let needDelete = true
                if(foundArticles[art].article.type && foundArticles[art].article.type.startsWith(type)) {
                  needDelete = false
                }

                if(needDelete) foundArticles.splice(art)
              }
            }
          }

        }

      }

      fs.readFile(configs.html_files.searchers, (err, data) => {
        if(err) {
          res.writeHead(404, "The requested file haven't been finded...")
          res.end('ERROR')
          return
        }

        res.writeHead(200)
        res.write(data.toString().replace(configs.replacers.searchers, JSON.stringify(foundArticles)))
        res.end()
      })
    break;

    // read article
    case '/article': 
      let type = pageInformations.query[configs.query.queryType]  
      let file = pageInformations.query.name.join(' ')
      if(!type || !file) return goIndex()  

      let article = fs.readFileSync(configs.main_path + type + '/' + file).toString()
      let articleInfos = getArticleInformations(article, type, file)
      
      articleInfos.content = marked.parse(articleInfos.content)

      let data = fs.readFileSync(configs.html_files.articles, {encoding: 'utf-8'}).toString()
      data = data.replace(configs.replacers.articles, JSON.stringify(articleInfos))

      res.writeHead(200)
      res.write(data)
      res.end()
    break

    default:
      goIndex()
    break;
  }

  /**
   * @param fileContent The string content
   * @param type The type of the article
   * @param fileName The name of the file
   * @returns JSON Object
   */
  function getArticleInformations(fileContent, type, fileName) {
    fileContent = fileContent.toString()
    let articleInformations = {}
    while(fileContent.startsWith('\n') || fileContent.startsWith(' ')) {
      if(fileContent.startsWith('\n')) {
        fileContent.replace('\n','')
      }else {
        fileContent.replace(' ','')
      }
    }

    let splited = fileContent.split('\n')

    while(splited[0].startsWith('@')) {
      let info = splited.shift()
      let content = info.split(' ')
      articleInformations[content.shift().toLowerCase().replace('@','')] = content.join(' ').split('\r').join('')
    }

    articleInformations.path = type + '/' + fileName
    articleInformations.type = type
    articleInformations.file = fileName
    articleInformations.content = splited.join('\n')

    return articleInformations
  }

  return


  // read article
  if(query[configs.query.name]) {
    let filePath = configs.main_path + query[configs.query.queryType] + '/' + query[configs.query.name].join(' ') + ".md"

    try {
      var article = fs.readFileSync(filePath).toString()
    } catch (e) {
      return res.end('Article does\'t found!')
    }
    
    try {
      var initPage = fs.readFileSync(configs.html_files.articles).toString()
    } catch (e) {
      return res.end('Error when loaded the main page...')
    }
    let articlePart = article.split(configs.md_desc_ender)

    article = {
      "infos": JSON.stringify(articlePart[0]),
      "content": marked(articlePart[1])
    }

    initPage = initPage.split(configs.replacers.articles).join(JSON.stringify(article))

    return res.end(initPage)

  }
  
  // search articles
  if(query[configs.query.querySearch]) {
    let articlesLinks = []

    try {
      var sct = fs.readdirSync(configs.main_path)
    } catch (e) {
      console.log(e);
      return res.end('An error as come. Developer has been target!')
    }
    
    if(query[configs.query.queryType]) {
      try {
        let newSct = []
        for(let fType of sct) {
          for(let type of query[configs.query.queryType]) {
            if(fType === type) {
              newSct.push(fType)
            }
          }
        }
        sct = newSct
      } catch (e) {
        console.log(e);
      }
    }

    for(let f of sct) {
      if(f.split('.').length === 1) {
        try {
          var files = fs.readdirSync(configs.main_path + f)
        } catch (e) {
          console.log(e);
          return res.end('An error as come. Developer has been target!')
        }
        for(let md of files) {
          articlesLinks.push({
            "path": configs.main_path + f + '/' + md,
            "link": '/' + f + `?${configs.query.name}=` + md.replace('.md','')
          })
        }
      }
    }

    let searchKeys;

    if(query[configs.query.querySearch].join('') === configs.prefix_show_all_articles) {
      searchKeys = " "
    }else {
      searchKeys = query[configs.query.querySearch]
      if(!searchKeys.join('')) return goIndex()
    }

    let articlesFounded = []

    for(let link of articlesLinks) {
      let searchPoints = 0

      try {
        var content = fs.readFileSync(link.path, {encoding: 'utf-8'})
      }catch (e) {
        console.log(e);
        return res.end('ERROR')
      }

      let elements = content.split(configs.md_desc_ender)
      try {
        var props = JSON.parse(elements[0])
      } catch (error) {
        console.error("ARTICLE UNREADIBLE", link)
        continue
      }

      let infos = {
        "name": {
          "points":10,
          "value":props.name
        },
        "description": {
          "points":5,
          "value":props.description
        },
        "version": {
          "points":2,
          "value":props.version
        }
      }

      for(let key of searchKeys) {
        
        for(let p in infos) {
          let contain = infos[p].value ? props[p].toLocaleLowerCase().includes(key) : false
          if(contain) {
            searchPoints+=infos[p].points
          }
        }
        
        if(elements[1].toLocaleLowerCase().includes(key)) {
          searchPoints++
        }
      }

      if(searchPoints>0) {
        articlesFounded.push({
          "name": props.name,
          "desc": props.description,
          "version": props.version,
          "banner": props.banner,
          "content": elements[1],
          "path": link.link,
          "searchPoints": searchPoints
        })
      }
    }

    try {
      var file = fs.readFileSync(configs.html_files.searchers)
    } catch (e) {
      console.log(e);
      return res.end('ERROR')
    }

    if(articlesFounded.length === 0) {
      return res.end('No articles found')
    }

    let stringDatas = JSON.stringify(articlesFounded)

    file = file.toString().replace(configs.replacers.searchers, stringDatas)

    return res.end(file)
  }
  
  // if there isn't a search/prevent/... return to the index of the webapp
  goIndex()


  // define the function goIndex()
  function goIndex() {
    fs.readFile(configs.html_files.index, (err, f) => {
      if(err) return res.end('OUPS... A probleme come here...')

      res.end(f)
    })
  }
})