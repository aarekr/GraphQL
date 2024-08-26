import { gql, useQuery } from '@apollo/client'
import { useState } from 'react';

const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name,
      born,
      bookCount,
    }
  }
`

const App = () => {
  const [page, setPage] = useState("authors");
  const result = useQuery(ALL_AUTHORS)

  if (result.loading)  {
    return <div>loading...</div>
  }

  return(
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
      </div>
      <h2>Authors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {result.data.allAuthors.map(author => 
            <tr key={author.name}>
              <td>{author.name}</td>
              <td align="center">{author.born}</td>
              <td align="center">{author.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
