import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from './queries'

const Authors = (props) => {
    if (!props.show) {
        return null
    }

    const result = useQuery(ALL_AUTHORS, {
        pollInterval: 2000
    })

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
        </div>
    )
}

export default Authors
