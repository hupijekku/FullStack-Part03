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

let persons = [  
    {    
        id: 1,    
        name: "Arto Hellas",    
        number: "040-123456",    
    },  
    {    
        id: 2,    
        name: "Ada Lovelace",    
        number: "39-44-5323523"
    },  
    {    
        id: 3,    
        name: "Dan Abramov",    
        number: "12-43-234345" 
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

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
    
    if(!body.name) {
        return res.status(400).json({
            error: 'Name missing'
        })
    }
    if(!body.number) {
        return res.status(400).json({
            error: 'Number missing'
        })
    }

    if(persons.filter(person => person.name === body.name).length > 0) {
        return res.status(400).json({
            error: 'Name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(resp => {
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

    if(error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        console.log('WUT')
        return res.status(400).json({ error: error.message })
    } else if (error.name === 'TypeError') {
        console.log('DERP')
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})