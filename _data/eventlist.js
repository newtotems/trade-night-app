const faunadb = require('faunadb');
const q = faunadb.query;

module.exports = async function() {
  const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
  
  const now = new Date().toISOString();

  try {
    const result = await client.query(
      q.Map(
        q.Paginate(
          q.Filter(
            q.Documents(q.Collection('events')),
            q.Lambda(
              'event',
              q.GTE(q.Select(['data', 'date'], q.Get(q.Var('event'))), now)
            )
          )
        ),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    return result.data.map(event => ({
      id: event.ref.id,
      ...event.data
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};