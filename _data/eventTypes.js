const { Client, query: q } = require('faunadb');

// Initialize the Fauna client
const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

export async function getEventTypes() {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventTypes'))),
        q.Lambda('ref', 
          q.Let(
            { doc: q.Get(q.Var('ref')) },
            {
              eventTypeId: q.Select(['data', 'eventTypeId'], q.Var('doc')),
              name: q.Select(['data', 'name'], q.Var('doc'))
            }
          )
        )
      )
    );

    return result.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return [];
  }
}