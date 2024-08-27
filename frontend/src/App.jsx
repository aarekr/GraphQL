import { gql, useQuery } from '@apollo/client'
import { useState } from 'react';
import Authors from "./components/Authors";
import Books from './components/Books';

/*const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name,
      born,
      bookCount,
    }
  }
`

const ALL_BOOKS = gql`
  query {
    allBooks  {
      title,
      author,
      published,
    }
  }
`*/

const App = () => {
  const [page, setPage] = useState("authors");
  /*const result = useQuery(ALL_AUTHORS)

  if (result.loading)  {
    return <div>loading...</div>
  }*/

  return(
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
      </div>
      <Authors show={page === "authors"} />
      <Books show={page === "books"} />
      <hr />
      
    </div>
  )
}

export default App
