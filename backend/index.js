const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')

require('dotenv').config()

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    bookCount: Int
    born: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, title: String, genre: String): [Book!]!
    allAuthors(name: String): [Author!]!
  }

  type Mutation {
    addBook(
      title: String
      author: String
      published: Int
      genres: [String]
    ): Book
    addAuthor(
      name: String
    ): Author
    editAuthor(
      name: String
      setBornTo: Int
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log('allBooks args:', args)
      if (args.title) {
        const result = await Book.find({ title: args.title })
        return result
      }
      const result = await Book.find({})
      return result
    },
    allAuthors: async (root, args) => {
      console.log('allAuthors args:', args)
      if (args.name) {
        const result = await Author.find({ name: args.name })
        return result
      }
      const result = await Author.find({})
      return result
    },
  },
  Author: {
    bookCount: ({ name }) => countAuthorsBooks(name)
  },
  Mutation: {
    addBook: async (root, args) => {
      const book = new Book({ ...args })
      console.log("Backend index.js addBook book:", book)
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return book
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      console.log("Backend index.js addAuthor author:", author)
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Updating author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    }
  }
}

function addNewBook(root, args) {
  if (!authors.find(author => author.name == args.author)) {
    addNewAuthor(root, args)
  }
  //const book = { ...args, id: uuid() }
  const book = { ...args }
  books = books.concat(book)
  return book
}

function addNewAuthor(root, args) {
  const author = {
    name: args.author,
    id: uuid(),
    born: args.born ? args.born : null,
  }
  authors = authors.concat(author)
  return author
}

function countAuthorsBooks(name) {
  let count = 0;
  books.forEach(book => book.author == name ? count++ : 0);
  return count;
}

function getBooks(root, args) {
  if (args.genre != undefined && args.author != undefined) {
    return books
      .filter(book => book.author == args.author)
      .filter(book => book.genres.includes(args.genre))
  }
  else if (args.genre != undefined) {
    return books.filter(book => book.genres.includes(args.genre))
  }
  else if (args.author != undefined) {
    return books.filter(book => book.author == args.author)
  }
  return books
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
