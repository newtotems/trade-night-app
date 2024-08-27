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
          q.Select(['data'], q.Get(q.Var('ref')))
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