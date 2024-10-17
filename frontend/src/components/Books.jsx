import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from './queries'

const Books = (props) => {
    const result = useQuery(ALL_BOOKS, {
        pollInterval: 2000
    })

    if (!props.show) {
      return null
    }

    if (result.loading)  {
        return <div>loading...</div>
    }

    let modifiedBooks = []
    //console.log('Books result books  :', result.data.allBooks)
    for (let i=0; i<result.data.allBooks.length; i++) {
        //console.log('---> ', result.data.allBooks[i])
        //console.log('     ', result.data.allBooks[i]['title'], result.data.allBooks[i]['published'])
        //console.log('     ', result.data.allBooks[i]['author']['name'])
        let newRow = [
            result.data.allBooks[i]['title'],
            result.data.allBooks[i]['author']['name'],
            result.data.allBooks[i]['published']
        ]
        modifiedBooks.push(newRow)
        //setBookList(bookList.concat(newRow))
    }
    console.log('modifiedBooks:', modifiedBooks)

    return (
        <div>
            <h2>Books</h2>
            <table>
                <thead>
                <tr>
                    <th align='left'>Title</th>
                    <th align='left'>Author</th>
                    <th>Published</th>
                </tr>
                </thead>
                <tbody>
                {modifiedBooks.map(book => 
                    <tr key={book[0]}>
                        <td>{book[0]}</td>
                        <td>{book[1]}</td>
                        <td width='120' align="center">{book[2]}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}

export default Books
