const { ApolloServer } = require('@apollo/server')
//const { startStandaloneServer } = require('@apollo/server/standalone')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { subscribe } = require('diagnostics_channel')

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
    title: String
    published: Int
    author: Author
    genres: [String]
    id: ID!
  }

  type Author {
    name: String
    bookCount: Int
    born: Int
  }

  type User {
    username: String!
    favoritegenre: String
    id: ID!
  }

  type Token {
    value: String!
  }
  
  type Subscription {
    bookAdded: Book
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, title: String, genre: String): [Book!]!
    allAuthors(name: String): [Author!]!
    me: User
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

    createUser(
      username: String!
      favoritegenre: String
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      //console.log('allBooks args:', args)
      if (args.title) {
        const result = await Book.find({ title: args.title })
        return result
      }
      //const result = await Book.find({})
      const result = await getBooks(root, args)
      //console.log('allBooks result:', result)
      return result
    },
    allAuthors: async (root, args) => {
      //console.log('allAuthors args:', args)
      if (args.name) {
        const result = await Author.find({ name: args.name })
        return result
      }
      const result = await Author.find({})
      return result
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: ({ name }) => countAuthorsBooks(name)
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let book = new Book({ ...args })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const authorObject = await getAutorID(args.author)
      if (authorObject.length == 0) {
        const newAuthorObject = await addNewAuthor(root, args, context)
        book['author'] = newAuthorObject['_id'].toString()
      } else if (authorObject.length > 0) {
        book['author'] = authorObject[0]['_id'].toString()
      }
      console.log('valmis book: ', book)
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
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book
    },
    addAuthor: async (root, args, context) => {
      const author = new Author({ ...args })
      console.log("Backend index.js addAuthor author:", author)
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
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
    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
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
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoritegenre: args.favoritegenre })
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      //console.log('userToken: ', userForToken)
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
}

/********************** helper functions **********************/

async function addNewAuthor(root, args, context) {
  console.log('addNewAuthor args:', args)
  const author = new Author({
    name: args.author,
    born: args.born ? args.born : null,
  })
  console.log('addNewAuthor new author:', author)
  author.save()
  return author
}

async function countAuthorsBooks(name) {
  let count = 0;
  const authors = await Author.find({})
  let searchedAuthor;
  for (let i=0; i<authors.length; i++) {
    if (authors[i]['name'] == name) {
      searchedAuthor = authors[i]
    }
  }
  //books.forEach(book => book.author == name ? count++ : 0);
  const books = await Book.find({})
  for (let i=0; i<books.length; i++) {
    if (books[i]['author'].toString() == searchedAuthor['_id'].toString()) {
      count++
    }
  }
  return count;
}

async function getAutorID(name) {
  console.log('getAuthorID name:', name)
  const author = await Author.find({ name: name})
  return author
}

async function getBooks(root, args) {
  //console.log('getBooks args:', args)
  const books = await Book.find({})
  const authors = await Author.find({})
  let booksModified = []
  for (let i=0; i<books.length; i++) {
    for (let j=0; j<authors.length; j++) {
      if (books[i]['author'].toString() == authors[j]['_id'].toString()) {
        let newBookObject = {
          '_id': books[i]['_id'],
          'title': books[i]['title'],
          'published': books[i]['published'],
          'author': authors[j],
          'genres': books[i]['genres'],
          '__v': books[i]['__v'],
        }
        booksModified.push(newBookObject)
      }
    }
  }
  return booksModified
}

/********************** server **********************/

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
  
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  })
  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id)
          return { currentUser }
        }
      },
    }),
  )
  const PORT = 4000
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  )
}
start()

/*
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
*/
