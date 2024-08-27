import { gql, useQuery } from '@apollo/client'

const Authors = (props) => {
    if (!props.show) {
        return null
    }

    const ALL_AUTHORS = gql`
        query {
            allAuthors  {
            name,
            born,
            bookCount,
            }
        }
    `
    const result = useQuery(ALL_AUTHORS)

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
