const { initializeApp, cert } = require("firebase-admin/app");

const serviceAccount = require("../servicehub-7734d-firebase-adminsdk-fbsvc-954e2b3437.json");

const app = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = app;