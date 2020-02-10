const mongoose = require('mongoose')

if(process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://hupijekku:${password}@cluster0-xet6t.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length === 3) {
  Person.find({}).then(res => {
    res.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const person = new Person({
    name: `${process.argv[3]}`,
    number: `${process.argv[4]}`
  })
  console.log(`Adding person ${process.argv[3]} with number ${process.argv[4]}`)
  person.save().then(() => {
    mongoose.connection.close()
  })
} else {
  console.log('Missing parameters')
  mongoose.connection.close()
}