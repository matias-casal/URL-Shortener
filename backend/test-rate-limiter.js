// Test script for rate limiter
const fetch = require("node-fetch");

// Configuration
const API_URL = "http://localhost:4000/api/urls";
const TOTAL_REQUESTS = 15; // More than our limit of 10
const TEST_URL = "https://example.com";

async function testRateLimiter() {
  console.log(`Starting rate limiter test: ${TOTAL_REQUESTS} requests...`);

  const results = {
    success: 0,
    rateLimited: 0,
    errors: 0,
  };

  // Function to send a single request
  const sendRequest = async (index) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: TEST_URL }),
      });

      const data = await response.json();

      if (response.status === 429) {
        console.log(`Request ${index + 1}: RATE LIMITED (429)`);
        results.rateLimited++;
        return { status: 429, data };
      } else if (response.ok) {
        console.log(`Request ${index + 1}: SUCCESS (${response.status})`);
        results.success++;
        return { status: response.status, data };
      } else {
        console.log(`Request ${index + 1}: ERROR (${response.status})`);
        results.errors++;
        return { status: response.status, data };
      }
    } catch (error) {
      console.error(`Request ${index + 1}: FAILED - ${error.message}`);
      results.errors++;
      return { status: "error", error: error.message };
    }
  };

  // Send all requests as fast as possible
  const promises = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    promises.push(sendRequest(i));
  }

  await Promise.all(promises);

  // Print summary
  console.log("\nTest Results Summary:");
  console.log(`- Successful requests: ${results.success}`);
  console.log(`- Rate limited requests: ${results.rateLimited}`);
  console.log(`- Error requests: ${results.errors}`);

  if (results.rateLimited > 0) {
    console.log("\nRate limiter is working correctly!");
  } else {
    console.log("\nRate limiter test failed - no requests were rate limited");
  }
}

testRateLimiter().catch((err) => {
  console.error("Test failed with error:", err);
});
