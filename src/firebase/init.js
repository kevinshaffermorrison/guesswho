const firebase = require('firebase/app');
require('firebase/firestore');
// const firebase = require("firebase");
  
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyBAsBEQJ4el2p480noi8xC05FhfEuox5Bw",
    authDomain: "codenames-46d41.firebaseapp.com",
    databaseURL: "https://codenames-46d41.firebaseio.com",
    projectId: "codenames-46d41",
    storageBucket: "codenames-46d41.appspot.com",
    messagingSenderId: "974757777954",
    appId: "1:974757777954:web:1daf248358309cece5307b",
    measurementId: "G-DECJN31G0Q"
  }
  const app = firebase.initializeApp(firebaseConfig);

  export default app.firestore();
