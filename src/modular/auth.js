console.log('modular/auth');
// import { async } from '@firebase/util';
import { 
    connectAuthEmulator, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    getIdToken,
    signOut,
    signInWithCustomToken,
    updateProfile,
    updateEmail,
    sendEmailVerification,
    updatePassword,
    sendPasswordResetEmail,
    deleteUser,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    EmailAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';

// const admin = require('firebase/admin');

connectAuthEmulator(auth, 'http://localhost:25001');

const userData = [
    {
        email: 'randomuser@email.com',
        password: 'r@nd0mP@ssw0rd'
    },
    {
        email: 'weebuser@email.com',
        password: 'w33bP@ssw0rd'
    }
];

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'https://www.example.com/finishSignUp?cartId=1234',
    // This must be true.
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.example.ios'
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: 'example.page.link'
};

// userData.forEach(user => signupEmailPassword(user.email, user.password));
// signupEmailPassword(userData[1].email, userData[1].password);
async function signupEmailPassword(email, password){
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // signed in
        const user = userCredential.user;
        console.log('signed-up with email-password')
        console.log(user);
    } catch( err ) {
        if(err.code === 'auth/email-already-in-use') {
            console.log('already-signed-in')
        } else {
            console.error('email-password signup error: ', err)
        }

    }
}

// observer, called when user-signin state changes
listenToAuthChanges(auth);
function listenToAuthChanges(auth) {
    const unsubAuthChange = onAuthStateChanged(auth, user => {
        console.log('observer: auth-state-changed');
        if(user) {
            // user signed-in
            console.log('signed-in');
            
            user.providerData.forEach((profile) => {
                console.log("Sign-in provider: " + profile.providerId);
                console.log("  Provider-specific UID: " + profile.uid);
                console.log("  Name: " + profile.displayName);
                console.log("  Email: " + profile.email);
                console.log("  Photo URL: " + profile.photoURL);
            });

            // const uid = user.uid;
            getIdToken(user, true)
            .then(token => {
                console.log('token: ', token)
                window.localStorage.setItem('tokenForSignin', token);
            })
            .catch(err => console.error('error on state-change-observation-token-save: ',err));
        } else {
            // user signed-out
            console.log('sign-out or no-sign-in');
            localStorage.setItem('tokenForSignin', undefined);
        }
        console.log('observer-------------------');
    })
    // unsubAuthChange();
}

// signOutFunc();
async function signOutFunc() {
    try{
        await signOut(auth);
        console.log('signed out successfully')
    } catch( err ) {
        console.error('signout error: ',err);
    }
}

// loginEmailPassword(auth);
async function loginEmailPassword(auth){
    try {
        await signInWithEmailAndPassword(auth, userData[0].email, userData[0].password);
        console.log('logged-in')
    } catch (error) {
        console.error('login-error',error);
    }
    
}

if(window.localStorage.getItem('tokenForSignin')) {
    signinWithToken(window.localStorage.getItem('tokenForSignin'));
}

// get user profile
// getUserProfile(auth); // N/A
function getUserProfile(auth){
    console.log('get-user-profile');
    const user = auth.currentUser;
    if(user !== null) {
        // this res needs to be validated manually
        const displayName = user.displayName;
        const email = user.email;
        const photoURL = user.photoURL;
        const emailVerified = user.emailVerified;

        const uid = user.uid
        console.log('user-profile:', {displayName, email, photoURL, emailVerified, uid});
    } else {
        console.log('no user to query profile');
    }
}

// get provider information
// getProviderInfo();
function getProviderInfo(){
    if(auth.currentUser !== null) {
        auth.currentUser.providerData.forEach(profile=>{
        console.log("Sign-in provider: " + profile.providerId);
        console.log("  Provider-specific UID: " + profile.uid);
        console.log("  Name: " + profile.displayName);
        console.log("  Email: " + profile.email);
        console.log("  Photo URL: " + profile.photoURL);

        })
    } else {
        console.log('no user to query provider info');
    }
}

// update profile
// loginEmailPassword(auth)
// .then(()=>updateUserProfile())
// .catch(err=>console.log('login-update:error', err));
async function updateUserProfile(){
    try {
        await updateProfile(auth.currentUser, {
            displayName: 'shikamaru',
            // photoURL: 'https://example.com/shikamaru-user/profile.jpg'
        })
        console.log('profile updated');
    } catch(err) {
        console.error('profile update error: ',err);
    }
}

// set email address
// loginEmailPassword(auth)
// .then(()=>updateUserEmail())
// .catch(err=> console.log('login-email-update-error:',err));
function updateUserEmail(){
    updateEmail(auth.currentUser, 'updated_user@example.com')
    .then(()=>console.log('email updated'))
    .catch(err=>console.error('email-update error: ',err));
}

// send verification email
// loginEmailPassword(auth)
// .then(()=>emailVerification(auth))
// .catch(err=>console.error('login-email-verification-error:', err));
function emailVerification(auth){
    // can update language code
    // auth.languageCode='it';
    // or auth.useDeviceLanguage();
    sendEmailVerification(auth.currentUser, actionCodeSettings)
    .then(()=>console.log('email verification sent'))
    .catch(err=>console.error('email-verification-error:',err));
}

// set password
// loginEmailPassword(auth)
// .then(()=>changePassword())
// .catch(err=>console.error('login-password-update-error:', err));
function changePassword(){
    updatePassword(auth.currentUser, 'some random new password')
    .then(()=>console.log('password-updated'))
    .catch(err=>console.error('password-change-error',err));
}

// send password-reset email
// loginEmailPassword(auth)
// .then(()=>resetPassword())
function resetPassword(){
    sendPasswordResetEmail(auth, auth.currentUser.email, actionCodeSettings)
    .then(()=>console.log('password reset email sent'))
    .catch(err=>console.error('password-reset-error:',err));
}

// delete user, requires user have signed in recently, else re-authenticate
// loginEmailPassword(auth)
// .then(()=>removeUser())
function removeUser(){
    deleteUser(auth.currentUser)
    .then(()=>console.log('user-deleted'))
    .catch(err=>console.error('user-delete-error',err));
}

// re-authenticate user
// get user credentials
/*
const user = userData[1];
signInWithEmailAndPassword(auth, user.email, user.password)
.then(()=>console.log(`${user.email} logged in`))
.then(()=>{
    const userCredential = EmailAuthProvider.credential(user.email, user.password);
    reauthenticateWithCredential(auth.currentUser, userCredential);
})
.then(()=>console.log('user re-authenticated'))
.catch(err=>console.error('login-re-authentication-error:', err));
*/