const axios = require('axios');

const getLanguageById = (lang) => {
  const language = {
    'c++': 54,
    java: 62,
    javascript: 63,
  };
  return language[lang.toLowerCase()];
};

/**
 * Submit a batch of code submissions to Judge0
 */
const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: { base64_encoded: 'false' },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: { submissions },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Judge0 submitBatch error:', error.message);
    throw new Error('Failed to submit code to judge');
  }
};

/**
 * Wait for a given time in milliseconds (properly promisified)
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Poll Judge0 until all submissions have completed
 * @param {string[]} resultToken - Array of submission tokens
 * @param {number} maxRetries - Maximum number of poll attempts (default: 20)
 */
const submitToken = async (resultToken, maxRetries = 20) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(','),
      base64_encoded: 'false',
      fields: '*',
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    },
  };

  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.request(options);
      const result = response.data;

      const isResultObtained = result.submissions.every(
        (r) => r.status_id > 2
      );

      if (isResultObtained) return result.submissions;

      retries++;
      await wait(1500); // Wait 1.5s between polls
    } catch (error) {
      console.error('Judge0 polling error:', error.message);
      retries++;
      await wait(2000);
    }
  }

  throw new Error('Judge0 polling timed out after ' + maxRetries + ' attempts');
};

module.exports = { getLanguageById, submitBatch, submitToken };
