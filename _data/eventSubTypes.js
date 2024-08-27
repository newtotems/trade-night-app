import { query as q } from 'faunadb'
import { faunaClient } from '../utils/fauna-auth'

export default async function getEventSubTypes() {
  try {
    const { data } = await faunaClient.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventSubTypes'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    )

    return data.map((item) => ({
      id: item.ref.id,
      ...item.data,
    }))
  } catch (error) {
    console.error('Error fetching event sub types:', error)
    return []
  }
}
