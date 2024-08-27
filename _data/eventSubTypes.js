const faunadb = require('faunadb');
const q = faunadb.query;

module.exports = async function() {
  const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('eventSubTypes'))),
        q.Lambda(
          'ref',
          q.Let(
            {
              eventSubType: q.Get(q.Var('ref'))
            },
            {
              eventSubTypeId: q.Select(['data', 'eventSubTypeId'], q.Var('eventSubType')),
              eventTypeId: q.Select(['data', 'eventTypeId'], q.Var('eventSubType')),
              name: q.Select(['data', 'name'], q.Var('eventSubType'))
            }
          )
        )
      )
    );

    console.log('Fetched event subtypes:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error fetching event subtypes:', error);
    return [];
  }
};
