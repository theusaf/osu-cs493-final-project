
var admin = require("firebase-admin");

var serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
