import firebase from 'firebase/app';

import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';

var firebaseConfig = {
  apiKey: "AIzaSyBpIU2tfS88gW-ymSKe9D6rPYx8sxnbPtk",
  authDomain: "testwebrtc-aef1d.firebaseapp.com",
  projectId: "testwebrtc-aef1d",
  storageBucket: "testwebrtc-aef1d.appspot.com",
  messagingSenderId: "966410313197",
  appId: "1:966410313197:web:5d2772aa6a47ff9a811be4",
  measurementId: "G-LLLTN8YFR0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore();
const dt = firebase.database();


export { db, auth, dt };
export default firebase;
