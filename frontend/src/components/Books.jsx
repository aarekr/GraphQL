import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from './queries'

const Books = (props) => {
    if (!props.show) {
      return null
    }

    const result = useQuery(ALL_BOOKS, {
        pollInterval: 2000
    })

    if (result.loading)  {
        return <div>loading...</div>
    }

    return (
        <div>
            <h2>Books</h2>
            <table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Published</th>
                </tr>
                </thead>
                <tbody>
                {result.data.allBooks.map(book => 
                    <tr key={book.title}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td align="center">{book.published}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}

export default Books
