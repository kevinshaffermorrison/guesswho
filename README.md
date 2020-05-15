# vue-codenames

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Firebase setup
There needs to be an init.js file in the src/firebase directory with the following format:

```javascript
const firebase = require('firebase/app');
require('firebase/firestore');
  
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
  const app = firebase.initializeApp(firebaseConfig);

  export default app.firestore();
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
