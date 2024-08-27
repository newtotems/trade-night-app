const faunadb = require('faunadb');
const q = faunadb.query;

module.exports = async function() {
  const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
  
  const now = new Date().toISOString();

  try {
    // Fetch all future events
    const eventsResult = await client.query(
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

    // Fetch all event types
    const eventTypesResult = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventTypes'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    // Create a map of event types for easy lookup
    const eventTypesMap = eventTypesResult.data.reduce((acc, eventType) => {
      acc[eventType.data.eventTypeId] = eventType.data;
      return acc;
    }, {});

    // Combine event data with event type data
    const combinedEvents = eventsResult.data.map(event => {
      const eventTypeData = eventTypesMap[event.data.eventTypeId] || null;
      return {
        id: event.ref.id,
        eventTypeData,
        eventTypeRefExists: !!eventTypeData,
        url: `/event/join/${event.ref.id}`,
        ...event.data
      };
    });

    return combinedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error.requestResult) {
      console.error('Request details:', JSON.stringify(error.requestResult, null, 2));
    }
    return [];
  }
};