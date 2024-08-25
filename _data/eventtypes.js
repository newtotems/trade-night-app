const faunadb = require('faunadb')
const q = faunadb.query

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
})

module.exports = async function() {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventTypes'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    )

    return result.data.map(item => item.data)
  } catch (error) {
    console.error('Error fetching eventTypes:', error)
    return []
  }
}
