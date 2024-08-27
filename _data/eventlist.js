const faunadb = require('faunadb');
const q = faunadb.query;

module.exports = async function() {
  const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
  
  const now = new Date().toISOString();

  try {
    // First, fetch all future events
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

    console.log('Events result:', JSON.stringify(eventsResult, null, 2));

    // Then, fetch all event types
    const eventTypesResult = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventTypes'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    console.log('Event types result:', JSON.stringify(eventTypesResult, null, 2));

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
        eventTypeName: eventTypeData ? eventTypeData.name : null,
        eventTypeData: eventTypeData || null,
        eventTypeId: event.data.eventTypeId,
        eventTypeRefExists: !!eventTypeData,
        url: `/event/join/${event.ref.id}`,
        ...event.data
      };
    });

    console.log('Combined events:', JSON.stringify(combinedEvents, null, 2));

    return combinedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error.requestResult) {
      console.error('Request details:', JSON.stringify(error.requestResult, null, 2));
    }
    return [];
  }
};