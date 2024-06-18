console.log("Starting...")

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

console.log("Creating Pool...")
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})
console.log("Done Creating Pool...")

console.log("Connecting To Pool...")
pool.connect(function(err, client, done) {
    if (err) {
      console.log(`Not able to get a connection: ${err}.`);
      response.status(400).send(err);
    }
    console.log("Start Fetching Matches...")
    fetchMatches(client, done)
    console.log("Finish Fetching Matches...")
    pool.end();
});
console.log("Done Connecting To Pool...")
console.log(`Success Date ${new Date()}`)


async function fetchMatches(client, done) {
    console.log("Fetching From HLTV...")
    const response = await fetch("https://hltv.org", {
      method: 'GET',
      headers: {
      },
    });
    console.log("Done Fetching From HLTV...")
    console.log(`Status: ${response.status}`)

    let html = await response.text();
    if (response.status === 200) {
      try {
        console.log("Start Database Ops...")
        // Clear the existing HTML entries
        await client.query('DELETE FROM html');
        // Insert new HTML content using parameterized query
        const insertQuery = 'INSERT INTO html (html) VALUES ($1)';
        await client.query(insertQuery, [html]);
        // Select and log all entries from the table
        const result = await client.query('SELECT * FROM html');
        // Perform cleanup or release resources if necessary
        done();
        console.log("Finish Database Ops...")
      } catch (error) {
        console.error('Error processing HTML content:', error);
      }
    }
  }
