import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR_YEAR } from './queries'
import { useState } from 'react'

const Authors = (props) => {
    const [ name, setName ] = useState('')
    const [ born, setYear ] = useState()
    
    const [ editAuthor ] = useMutation(EDIT_AUTHOR_YEAR)

    const submit = async (event) => {
        event.preventDefault()
        let setBornTo = born
        editAuthor({ variables: { name, setBornTo }})
        setName('')
        setYear('')
    }

    const result = useQuery(ALL_AUTHORS, {
        pollInterval: 2000
    })

    if (!props.show) {
        return null
    }

    if (result.loading)  {
        return <div>loading...</div>
    }

    return(
        <div>
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
            <br />
            <h2>Set birthyear</h2>
            <form onSubmit={submit}>
                <div>
                    Name:
                    <input value={name} onChange={({ target }) => setName(target.value)} />
                </div>
                <div>
                    Born:
                    <input value={born} onChange={({ target }) => setYear(Number(target.value))} />
                </div>
                <br />
                <button type="submit">update author</button>
            </form>
        </div>
    )
}

export default Authors
