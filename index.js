const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { response } = require('express')

const app = express() 

const outlets = [
{
    name: 'cbs',
    address: 'https://www.cbsnews.com/politics/',
    base: 'https://www.cbsnews.com'
    },     
    {
        name: 'cnbc',
        address: 'https://www.cnbc.com/politics/',
        base: 'https://www.cnbc.com'
    },      
    {
        name: 'cnn',
        address: 'https://www.cnn.com/specials/politics/joe-biden-news',
        base: 'https://www.cnn.com'
    }, 
    {
        name: 'forbes',
        address: 'https://www.forbes.com/news/',
        base: 'https://www.forbes.com'
    }, 
    {
        name: 'foxnews',
        address: 'https://www.foxnews.com/politics',
        base: 'https://www.foxnews.com'
    }, 
    {
        name: 'huffingtonpost',
        address: 'https://www.huffpost.com/news/topic/joe-biden',
        base: 'https://www.huffpost.com'
    },  
    {
        name: 'nbc',
        address: 'https://www.nbcnews.com/politics/white-house/',
        base: 'https://www.nbcnews.com'
    }, 
    {
        name: 'nytimes',
        address: 'https://www.nytimes.com/spotlight/joe-biden',
        base: 'https://www.nytimes.com'
    }, 
    {
        name: 'politico',
        address: 'https://www.politico.com/',
        base: 'https://www.politico.com/'
    },   
    {
        name: 'reuters',
        address: 'https://www.reuters.com/world/americas/',
        base: 'https://www.reuters.com/'
    },   
    {
        name: 'thehill',
        address: 'https://thehill.com/news/administration/',
        base: 'https://www.thehill.com/'
    }, 
    {
        name: 'usatoday',
        address: 'https://www.usatoday.com/news/politics/',
        base: 'https://www.usatoday.com/'
    },  
    {
        name: 'washingtonpost',
        address: 'https://www.washingtonpost.com/politics/',
        base: 'https://www.washingtonpost.com/'
    },  
    {
        name: 'yahoo',
        address: 'https://news.yahoo.com/politics/',
        base: 'https://news.yahoo.com'
    }, 
    
]
let articles = []


outlets.forEach(outlet => {
    axios.get(outlet.address) 
    .then(response => {
        const html = response.data 
        const $ = cheerio.load(html)

        $('a:contains("Biden")', html).each(function() {
            // Regex to remove excessive whitespace and line breaks
            const title = $(this).text().trim().replace(/(\r\n|\n|\r|[\"])/gm, '').replace(/\s\s+/g, ' ')
            const url = $(this).attr('href')
            if (url.includes(outlet.base) || (url.includes("https://video")) &&
            !(title.includes("<img")) && !(url.includes("espanol"))) {
                articles.push({
                    title, 
                    url,
                    source: outlet.name
                })
            } else if  (!(title.includes("<img")) && !(url.includes("espanol"))) {
                articles.push({
                    title, 
                    url: outlet.base + url,
                    source: outlet.name
                })
            }

        })
        articles = articles.filter((value, index, self) =>
        index === self.findIndex((t) => (
        t.url === value.url
      )))
    })
})


app.get('/', (req, res) => {
    res.json('Welcome to my President Joe Biden News API')
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:outletId', (req, res) => {
    const outletId = req.params.outletId 
    const outletAddress = outlets.filter(outlet => outlet.name == outletId)[0].address 
    const outletBase = outlets.filter(outlet => outlet.name == outletId)[0].base
    
    axios.get(outletAddress)
    .then(response => {
        const html = response.data 
        const $ = cheerio.load(html) 
        let specificArticles = []

        $('a:contains("Biden")', html).each(function() {
            const title = $(this).text().trim().replace(/(\r\n|\n|\r|[\"])/gm, '').replace(/\s\s+/g, ' ')
            const url = $(this).attr('href')

            if (url.includes(outlets.base) || (url.includes("https://video")) 
            && !(title.includes("<img")) &&  !(url.includes("espanol"))) {

            specificArticles.push({
                title,
                url,
                source: outletId
            })
        } else if (!(title.includes("<img")) && !(url.includes("espanol"))) {
            specificArticles.push({
                title,
                url: outletBase + url,
                source: outletId
        })
    }
    specificArticles = specificArticles.filter((value, index, self) =>
    index === self.findIndex((t) => (
    t.url === value.url
  ))
  )
        })
        res.json(specificArticles)
    }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))