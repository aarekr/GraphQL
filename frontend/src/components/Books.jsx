import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = (props) => {
    const [ chosenGenre, setChosenGenre ] = useState('all genres')
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
    let genres = [];
    for (let i=0; i<result.data.allBooks.length; i++) {
        result.data.allBooks[i].genres.map(genre => genres.includes(genre) ? null : genres.push(genre))
        const bookHasChosenGenre = result.data.allBooks[i].genres.map(genre => genre == chosenGenre ? true : false)
        if (chosenGenre == 'all genres') {
            // pass
        }
        else if (!bookHasChosenGenre.includes(true)) {
            continue
        }
        let newRow = [
            result.data.allBooks[i]['title'],
            result.data.allBooks[i]['author']['name'],
            result.data.allBooks[i]['published']
        ]
        modifiedBooks.push(newRow)
        //setBookList(bookList.concat(newRow))
    }
    console.log('modifiedBooks:', modifiedBooks)
    genres.push('all genres')
    console.log('genres        :', genres)

    return (
        <div>
            <h2>Books</h2>
            <p>in genre <b>{chosenGenre}</b></p>
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
            <br />
            <div>
                {genres.map(genre => 
                    <button key={genre} onClick={() => setChosenGenre(genre)}>{genre}</button>
                )}
            </div>
            <br /><hr />
        </div>
    )
}

export default Books
