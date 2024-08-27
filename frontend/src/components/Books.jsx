import { gql, useQuery } from '@apollo/client'

const Books = (props) => {
    if (!props.show) {
      return null
    }
  
    const ALL_BOOKS = gql`
        query {
            allBooks  {
            title,
            author,
            published,
            }
        }
    `
    const result = useQuery(ALL_BOOKS)

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
