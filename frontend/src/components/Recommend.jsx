import { useQuery } from '@apollo/client'
import { ALL_BOOKS, CURRENT_USER } from '../queries'

const Recommend = (props) => {
    const currentUser = useQuery(CURRENT_USER)
    const result = useQuery(ALL_BOOKS, { pollInterval: 2000 })

    if (!props.show) {
        return null
    }

    if (result.loading)  {
        return <div>loading...</div>
    }

    if (currentUser.loading)  {
        return <div>loading...</div>
    }

    let modifiedBooks = []
    let genres = [];
    for (let i=0; i<result.data.allBooks.length; i++) {
        result.data.allBooks[i].genres.map(genre => genres.includes(genre) ? null : genres.push(genre))
        const bookHasChosenGenre = result.data.allBooks[i].genres
            .map(genre => genre == currentUser.data.me.favoritegenre ? true : false)
        if (!bookHasChosenGenre.includes(true)) {
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

    console.log('current user username:', currentUser.data.me.username)
    console.log('current user favgenre:', currentUser.data.me.favoritegenre)

    return (
        <div>
            <h2>Recommendations</h2>
            <p>logged in user: {currentUser.data.me.username}</p>
            <p>books in your favorite genre <b>{currentUser.data.me.favoritegenre}</b></p>
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
            <br /><hr />
        </div>
    )
}

export default Recommend
