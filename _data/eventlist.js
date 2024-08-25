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
              eventType: q.Let(
                {
                  eventTypeRef: q.Match(q.Index('eventTypes_by_eventTypeId'), q.Select(['data', 'eventTypeId'], q.Var('event')))
                },
                q.If(
                  q.IsEmpty(q.Var('eventTypeRef')),
                  null,
                  q.Get(q.Select(0, q.Paginate(q.Var('eventTypeRef'))))
                )
              )
            },
            {
              id: q.Select(['ref', 'id'], q.Var('event')),
              eventTypeName: q.Select(['data', 'name'], q.Var('eventType'), ''),
              data: q.Select(['data'], q.Var('event'))
            }
          )
        )
      )
    );

    return result.data.map(event => ({
      id: event.id,
      eventTypeName: event.eventTypeName,
      ...event.data
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};