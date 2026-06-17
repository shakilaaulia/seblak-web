const store = require('../dataStore');

function getSummary(_req, res) {
  const summary = store.getDashboardSummary();
  res.json(summary);
}

module.exports = { getSummary };
