const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

const app = express()

morgan.token('type', function(req){return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))
app.use(express.json())
app.use(express.static('build'))
app.use(cors())

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(person => person.toJSON()))
  })
})

app.get('/info', (req, res) => {
  res.send(`<div>Phonebook has info for ${Person.length} people</div><div>${Date()}</div>`)
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if(person) {
      res.json(person.toJSON())
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(() => {
    res.status(204).end()
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true }).then(updatedPerson => {
    res.json(updatedPerson.toJSON())
  }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if(error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})