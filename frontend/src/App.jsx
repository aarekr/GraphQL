import { useApolloClient, useSubscription } from '@apollo/client'
import { useState } from 'react';
import { ALL_BOOKS, BOOK_ADDED } from './queries'

import Authors from "./components/Authors"
import Books from './components/Books'
import NewBook from "./components/NewBook"
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState("authors")
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log("useSubscription data:", data)
      const addedBook = data.data.bookAdded
      window.alert(`A new book was added: ${addedBook.title}`)
      notify(`${addedBook.title} added`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
      return {
        allBooks: allBooks.concat(addedBook)
      }
    })
  }
  })
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>
        <Authors show={page === "authors"} />
        <Books show={page === "books"} />
        <Notify errorMessage={errorMessage} />
        <LoginForm setToken={setToken} setError={notify} />
      </div>
    )
  }

  return(
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("addbook")}>add book</button>
        <button onClick={() => setPage("recommend")}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>
      <Notify errorMessage={errorMessage} />
      <Authors show={page === "authors"} />
      <Books show={page === "books"} />
      <Recommend show={page === "recommend"} />
      <NewBook show={page === "addbook"} setError={notify} />
    </div>
  )
}

export default App
