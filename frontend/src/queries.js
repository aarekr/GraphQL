import { gql } from "@apollo/client"

const BOOK_DETAILS = gql`
    fragment BookDetails on Book {
        title
        author {
            name
        }
        published
        genres
    }
`

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name,
            born,
            bookCount
        }
    }
`

export const ALL_BOOKS = gql`
    query {
        allBooks {
            title,
            published,
            author {
                name
            }
            genres
        }
    }
`

export const CURRENT_USER = gql`
    query {
        me {
            username,
            favoritegenre
        }
    }
`

export const ADD_BOOK = gql`
    mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(
            title: $title,
            author: $author,
            published: $published,
            genres: $genres
        ) {
            title
            author {
                name
            }
            published
            genres
        }
    }
`

export const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}
`

export const EDIT_AUTHOR_YEAR = gql`
    mutation editAuthor($name: String!, $setBornTo: Int) {
        editAuthor(
            name: $name,
            setBornTo: $setBornTo
        ) {
            name
            born
        }
    }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
