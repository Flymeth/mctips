let http = require('http')
let fs = require('fs')
let url = require('url')
let marked = require('marked')
let configs = require('./configs.json')

let srv = http.createServer().listen(configs.port).on('listening', () => {
  console.log('listen on port ' + srv.address().port);
})

srv.on('request', (req, res) => {
  let reqByUser = req.headers.referer === undefined || req.headers['sec-fetch-mode'] === "navigate"
  
  let reqURL = ('http://'+req.headers.host).split('http://').join('http://') + req.url

  let urlInfos = url.parse(decodeURI(reqURL))

  let sysType;
  let sysName;
  let sysSearch;
  let prevent;

  if(urlInfos.query) {
    sysType = urlInfos.pathname.replace('/','')
    sysName = urlInfos.query.split('&').find(e => e.split('=')[0] === configs.named.system)
    sysSearch = urlInfos.query.split('&').find(e => e.split('=')[0] === configs.named.search)
    prevent = urlInfos.query.split('&').find(e => e.split('=')[0] === configs.named.prevent)
  }
  
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


  if(sysName && !sysSearch) {

    // READ TIPS

    if (!sysName) {
      return res.end('Page hasnt found!')
    }
    
    let filePath = configs.main_path + sysType + '/' + sysName.split('%20').join(' ').split('=')[1] + ".md"
    
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
    
    article = marked(article.split(configs.md_desc_ender)[1])
    initPage = initPage.replace(configs.replacers.articles, marked(article))
    
    return res.end(initPage)

  }else if(sysSearch && !sysName) {

    // SEARCH TIPS

    let articlesLinks = []

    try {
      var sct = fs.readdirSync(configs.main_path)
    } catch (e) {
      console.log(e);
      return res.end('An error as come. Developer has been target!')
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
            "link": f + `?${configs.named.system}=` + md.replace('.md','')
          })
        }
      }
    }

    
    let searchKeys = sysSearch.toString().split('=')[1].split('%20').join('+').toLowerCase().split('+')
    if(searchKeys.length === 1 && searchKeys[0] === '') return goIndex()

    if(searchKeys[0] === "__all") {
      searchKeys = " "
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
        console.log(error);
        return res.end('Articles unreadible')
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
  }else if(sysName && sysSearch) {

    // SEARCH AND READ ERROR

    return res.end('Cannot search and find articles at the same time man the fucker...')
  }else {

    // INDEX
    goIndex()
  }

  function goIndex() {
    fs.readFile(configs.html_files.index, (err, f) => {
      if(err) return res.end('OUPS... A probleme come here...')

      res.end(f)
    })
  }
})