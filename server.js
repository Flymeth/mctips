let http = require('http')
let fs = require('fs')
let url = require('url')
let marked = require('marked')
let configs = require('./configs.json')

let srv = http.createServer().listen(configs.port).on('listening', () => {
  console.log('listen on port ' + srv.address().port);
})

srv.on('request', (req, res) => {
  if(!req.headers['sec-fetch-mode']) {
    return res.end('TON NAVIGATEUR PU LA MERDE')
  }

  let reqByUser = !req.headers.referer || req.headers['sec-fetch-mode'] === "navigate"
  
  let reqURL = ('http://'+req.headers.host).split('http://').join('http://') + req.url

  let urlInfos = url.parse(decodeURI(reqURL))

  let prevent = urlInfos.query ? urlInfos.query.split(' ').join('').split('&').find(e => e.split('=')[0] === configs.query.prevent) : undefined

  if(!reqByUser || prevent) {
    if(urlInfos.path === '/') return goIndex()
    let accept = req.headers.accept.split(',').find(t => t.includes(urlInfos.pathname.split('.')[1]))
    return fs.readFile('.' + urlInfos.pathname, (err, f) => {
      if(err) return res.end(err.toString())
      if(accept) {
        res.setHeader('Content-Type', accept)
      }
      res.end(f)
    })
  }
  
  let query = {}
  if(urlInfos.query) {
    for(let q in configs.query) {
      let element = urlInfos.query.split('&').find(e => e.split('=')[0] === configs.query[q])
      if(element && element.split('=')[1]) {
        query[configs.query[q]] = decodeURI(element.toLowerCase().split('=')[1]).split(' ').join('+').split('+')
      }
    }
  }

  
  let pathname = urlInfos.pathname.replace('/','')
  for(let type of configs.domain_types_path) {
    if(pathname === type) {
      query[configs.query.queryType] = [pathname]
      if(!query[configs.query.querySearch]) query[configs.query.querySearch] = [configs.prefix_show_all_articles]
    }
  }


  // read article
  if(query[configs.query.name]) {
    let filePath = configs.main_path + query[configs.query.queryType] + '/' + query[configs.query.name] + ".md"
    
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