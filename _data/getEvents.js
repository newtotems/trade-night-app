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
        q.Lambda(
          'ref',
          q.Let(
            {
              event: q.Get(q.Var('ref')),
              eventType: q.Get(
                q.Match(
                  q.Index('events_type'),
                  q.Select(['data', 'eventTypeId'], q.Var('event'))
                )
              )
            },
            {
              id: q.Select(['ref', 'id'], q.Var('event')),
              eventData: q.Select(['data'], q.Var('event')),
              eventTypeData: q.Select(['data'], q.Var('eventType'))
            }
          )
        )
      )
    );

    return result.data.map(item => ({
      id: item.id,
      ...item.eventData,
      eventTypeName: item.eventTypeData.name,
      eventTypeDescription: item.eventTypeData.description,
      // Add any other eventType fields you want to include
      // Prefix with 'eventType' if there's a naming clash
    }));
  } catch (error) {
    console.error('Error fetching events with event types:', error);
    return [];
  }
};
