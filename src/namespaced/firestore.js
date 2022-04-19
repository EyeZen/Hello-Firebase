console.log('firebase-namespaced');
// npm install firebase@8.10.1 --save
const firebase = require('firebase/app');
// required for side-effects
require('firebase/firestore');
// import firebase from 'firebase/app';
// import 'firebase/firestore';
import firebaseConfig from '../../config/firebase-key';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// add emulator
if(location.hostname === 'localhost') {
    // change port specified while doing firebase init
    db.useEmulator('localhost', 25002);
}

// add data
db.collection('users').add({
    firest: 'Ada',
    last: 'Lovelace',
    born: 1815
})
.then(docRef => {
    console.log('Document written with ID:', docRef.id);
})
.catch(err => {
    console.error('Error adding document: ', err);
})