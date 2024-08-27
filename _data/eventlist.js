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
              eventTypeId: q.Select(['data', 'eventTypeId'], q.Var('event')),
              eventTypeRef: q.Match(q.Index('events_type'), q.Var('eventTypeId')),
              eventType: q.If(
                q.IsEmpty(q.Var('eventTypeRef')),
                null,
                q.Get(q.Select(0, q.Var('eventTypeRef')))
              )
            },
            {
              id: q.Select(['ref', 'id'], q.Var('event')),
              eventTypeName: q.Select(['data', 'name'], q.Var('eventType'), null),
              eventTypeData: q.Select(['data'], q.Var('eventType'), null),
              eventTypeId: q.Var('eventTypeId'),
              eventTypeRefExists: q.Not(q.IsEmpty(q.Var('eventTypeRef'))),
              data: q.Select(['data'], q.Var('event')),
              url: q.Concat(['/event/join/', q.Select(['ref', 'id'], q.Var('event'))])
            }
          )
        )
      )
    );

    return result.data.map(event => ({
      id: event.id,
      eventTypeName: event.eventTypeName,
      eventTypeData: event.eventTypeData,
      eventTypeId: event.eventTypeId,
      eventTypeRefExists: event.eventTypeRefExists,
      url: event.url,
      ...event.data
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};