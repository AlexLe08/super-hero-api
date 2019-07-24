var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var models = require('./models')

var app = express()

var origin = process.env.NODE_ENV === 'production'
  ? ['https://superheroes.com', 'https://www.superheroes.com']
  : '*'

var corsOptions = {
  origin,
  allowedHeaders: ['Content-Type'],
  methods: 'GET,POST',
  optionsSuccessStatus: 200, // some legacy browsers choke on 204
}

app.use(cors(corsOptions))

app.get('/heroes', (request, response) => {
  models.Heroes.findAll({ include: { model: models.Teams } }).then((heroes) => {
    response.send(heroes)
  })
})

app.get('/heroes/:slug', (request, response) => {
  models.Heroes.findOne({
    where: { slug: request.params.slug },
    include: { model: models.Teams }
  }).then((hero) => {
    if (hero) {
      response.send(hero)
    } else {
      response.sendStatus(404)
    }
  })
})

app.post('/heroes', bodyParser.json(), (request, response) => {
  const { name, realname, firstappearance, slug, teamSlug } = request.body

  if (!name || !realname || !firstappearance || !slug || !teamSlug) {
    response.status(400).send('The following attributes are required: name, realname, firstappearance, slug, teamSlug')
  }

  models.Teams.findOne({ where: { slug: teamSlug } }).then((team) => {
    if (!team) {
      response.status(400).send(`Unknown team slug: ${teamSlug}`)
    } else {
      models.Heroes.create({ name, realName, firstAppearance, slug, teamId: team.id }).then((newHero) => {
        response.status(201).send(newHero)
      })
    }
  })
})

app.all('*', (request, response) => {
  response.sendStatus(404)
})

app.listen(1337, () => { console.log('Listening on 1337...') })

module.exports = app
