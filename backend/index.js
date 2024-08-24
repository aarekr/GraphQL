const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

// Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = `
  type Book {
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
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
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => getBooks(root, args),
    allAuthors: () => authors,
  },
  Author: {
    bookCount: ({ name }) => countAuthorsBooks(name)
  },
  Mutation: {
    addBook: (root, args) => addNewBook(root, args),
    addAuthor: (root, args) => addNewAuthor(root, args)
  }
}

function addNewBook(root, args) {
  console.log("args: ", args)
  console.log("authors: ", authors)
  //console.log("authors.find: ", authors.find(author => author.name == args.author))
  if (!authors.find(author => author.name == args.author)) {
    console.log("authoria ei löytynyt")
    addNewAuthor(root, args)
  }
  else {
    console.log("author löytyi")
  }
  const book = { ...args, id: uuid() }
  books = books.concat(book)
  return book
}

function addNewAuthor(root, args) {
  console.log("addNewAuthor args: ", args)
  const author = {
    name: args.author,
    id: uuid(),
    born: args.born ? args.born : null,
  }
  authors = authors.concat(author)
  console.log("valmis author: ", author)
  console.log("authors lisäyksen jälkeen: ", authors)
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
