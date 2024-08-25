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
        q.Lambda('ref', 
          q.Let(
            {
              event: q.Get(q.Var('ref')),
              eventType: q.Get(q.Ref(q.Collection('eventTypes'), q.Select(['data', 'eventTypeId'], q.Var('event'))))
            },
            {
              id: q.Select(['ref', 'id'], q.Var('event')),
              name: q.Select(['data', 'name'], q.Var('eventType')),
              data: q.Select(['data'], q.Var('event'))
            }
          )
        )
      )
    );

    return result.data.map(item => ({
      id: item.id,
      name: item.name,
      ...item.data
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};