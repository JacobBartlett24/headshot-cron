import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

console.log(process.env.POSTGRES_URL)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

pool.connect(function(err, client, done) {
    if (err) {
      console.log(`Not able to get a connection: ${err}.`);
      response.status(400).send(err);
    }
    fetchMatches(client, done)
    
    pool.end();
});

async function fetchMatches(client, done) {
    const response = await fetch("https://hltv.org", {
      method: 'GET',
      headers: {
      },
    });
  
    let html = await response.text();
    if (response.status === 200) {
      try {
        // Clear the existing HTML entries
        await client.query('DELETE FROM html');
        // Insert new HTML content using parameterized query
        const insertQuery = 'INSERT INTO html (html) VALUES ($1)';
        await client.query(insertQuery, [html]);
        // Select and log all entries from the table
        const result = await client.query('SELECT * FROM html');
        // Perform cleanup or release resources if necessary
        done();
      } catch (error) {
        console.error('Error processing HTML content:', error);
      }
    }
  }