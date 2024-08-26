const faunadb = require('faunadb');
const q = faunadb.query;

module.exports = async function() {
  const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventTypes'))),
        q.Lambda(
          'ref',
          q.Let(
            {
              eventType: q.Get(q.Var('ref'))
            },
            {
              eventId: q.Select(['data', 'eventTypeId'], q.Var('eventType')),
              name: q.Select(['data', 'name'], q.Var('eventType'))
            }
          )
        )
      )
    );

    console.log('Fetched event types:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return [];
  }
};