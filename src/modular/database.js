///////////////////////////////////////
/*    Firebase Realtime Database     */
///////////////////////////////////////
/**
 * { database, storage, auth, firestore, app } are initialized and exported in './firebase.js'
 * To try out any code segment:
 * * pass truthy value in the corresponding if-block
 *   or comment the if( condition ) part
 * * some blocks might depend on others, make sure to enable all dependencies 
 */

console.log('moduler-realtime-database');

import { database } from './firebase';
import { 
    connectDatabaseEmulator, 
    set,
    get,
    ref,
    onValue,
    child,
    push,
    update,
    remove,
    off, on,
    query,
    runTransaction
} from 'firebase/database';
import { updatePassword } from 'firebase/auth';

connectDatabaseEmulator(database, 'localhost', 25004);

///////////////////////////////////////
//            Sample Data            //
///////////////////////////////////////
const userData = [
    {   
        id: 123123213,
        name: 'albert',
        email: 'randomuser@email.com',
        password: 'r@nd0mP@ssw0rd',
        // imageUrl: imageUrl
    },
    {
        id: 342423234234,
        name: 'issac',
        email: 'weebuser@email.com',
        password: 'w33bP@ssw0rd'
        // imageUrl: imageUrl
    }
];
const postsData = [
    {
        author: userData[0].name,
        uid: userData[0].id,
        body: 'This is Einz. Am I that scarry?',
        title: 'Comment on Overlord:Einz Oool Gown',
        starCount: 0,
        // authorPic: picture

    },
    {
        author: userData[1].name,
        uid: userData[1].id,
        body: 'Because I have a position at assembly!duh!',
        title: 'Why I am right',
        starCount: 0,
        // authorPic: picture

    }
]

///////////////////////////////////////
//         Write To Database         //
///////////////////////////////////////
if(false) 
{
    // write users
    userData.forEach(user => writeUserData(user.id, user.name, user.email, user.password));
    function writeUserData(userId, name, email, password) {
        const userRef = ref(database, 'users/'+userId);
        set(userRef, {
            username: name,
            email: email,
            password: password
        }).then(()=>{console.log('data-set-successfully')})
        .catch(err=>console.error('database-set-error:', err));
    }
}

///////////////////////////////////////////
// Read from Database (initial + update) //
///////////////////////////////////////////
if(false) 
{
    // value-udpate-listener
    // reduces usage and billing
    const unsubUserData = onValue(
        ref(database, 'users/'),
        snapshot => {
            const data = snapshot.val();
            console.log('user-value:', data);
        }
    );
    unsubUserData(); // un-subscribe value-update-listener
}
///////////////////////////////////////
//          Read Data Once           //
///////////////////////////////////////
if(false)
{
    const user = userData[1];
    const dbRef = ref(database);
    // child takes parent-reference, not Database instance
    get(child(dbRef, `users/${user.id}`))
        .then(snapshot=>{
            console.log(`get-once ${user.id}`);
            if(snapshot.exists()) {
                console.log('user-exists:', snapshot.val());
            } else {
                console.log('no data available');
            }
        })
        .catch(err => {
            console.error('get-once-error:', err);
        })
}
//////////////////////////////////////////
// Getting Data Once ( locally-cached ) //
//////////////////////////////////////////
if(false) 
{
    // const userId = userData[0].id;
    const userId = 9999999999999;

    onValue(
        ref(database, 'users/'+userId),
        snapshot=>{
            const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            console.log('initializing user:', username);
        },
        {
            // quick-fetch data, (fetched data maybe locally cached copy)
            // good for data that updates less frequently
            onlyOnce: true
        }
    )
}
//////////////////////////////////////////
// Write multiple-values simultaneously //
//////////////////////////////////////////

// all updates are atomic
if(false)
{
    postsData.forEach(post => {
        createPost(post, post.uid)
            .then(()=>{
                console.log(
                    userData.find(user=>(user.id===post.uid)).name,
                    'posted new post!'
                );
            })
            .catch(err=>{
                console.error('update/user-post-error',err);
            })
    })
    function createPost(postData, uid) {
        const dbRef = ref(database);
        // push: generate new child-location, 
        // optionally assign value, or use ref/key to assign value later
        const newPostKey = push(child(dbRef, 'posts')).key;
        // updates-to-be-applied-in-database
        const updates = {};
        // key: relative-reference
        // value: value-assigned
        updates['/posts/' + newPostKey] = postData;
        updates['/user-posts/'+uid+'/'+newPostKey] = postData;

        return update(dbRef,updates);
    }
}
////////////////////////////////////
//          Delete Data           //
////////////////////////////////////

if(false) 
{
    // asynchronous code
    (async function(){
    try {
        const tempRef = ref(database, 'temp');
        // change value to run different sections
        const run_section = 0;
        switch(run_section)
        {
        case 1:
            // temp-data
            await set(tempRef, {
                data1: 'some random temporary data',
                data2: 'random stuff 2',
                data3: 'random stuff 3',
                data4: 'random stuff 4',
                data5: {
                    stuff: 'random stuff',
                    kind: 'random'
                }
            });
            console.log('set-temp-data');
            break;
        case 2:
            // delete-single / all
            await remove(tempRef);
            console.log('removed-temp-data');
            break;
        case 3:
            // delete-single / all
            await set(tempRef, null);
            console.log('set-removed-temp-data');
            break;
        case 4:
            // delete-multiple / children
            await update(tempRef, {
                data1: null,
                data5: null,
            })
            console.log('deleted-multiple-temp-children');
            break;
        default: console.log('delete/incorrect-choice');
        }
    } catch (err) {
        console.error('db-delete-error',err);
    }
    })();
}

///////////////////////////////////
//      Event Listener : N/A     //
///////////////////////////////////

if(false)
{
    const tempRef = ref(database, 'temp');
    // EVENTS: "value", "child_added", "child_changed", "child_removed", or "child_moved"
    const events = [
        "value", 
        "child_added", 
        "child_changed", 
        "child_removed", 
        "child_moved"
    ];
    const action    = 'add_listener';
    const eventType = 'child_added';
    const listeners = [];

    switch(action){
    case 'add_listener':
        const listener = tempRef.on(eventType, snapshot=>{
            console.log(eventType+'-event occured');
            console.log(snapshot.val());
        }, err => {
            console.error(eventType, ' listener-error', err);
        });
        console.log(eventType, 'listener added', listener);
        listeners.append(listener);
        break;
    case 'remove_listener':
        // remove all callbacks, if no callback(arg-3) passed
        listeners.forEach(listener => {
            off(tempRef, listener);
            console.log('event listener removed', listener);
        })
        break;
    default:
        console.error('database-event-listener/invalid choice');
    }
}

///////////////////////////////////////////////
//   Atomic Operations & Transactions : NA   //
///////////////////////////////////////////////

if(false) 
{
    function toggleStar(uid) {
        const postRef = ref(db, '/posts/foo-bar-123');

        // make sure to handle 'null' data
        runTransaction(postRef,/* current-state */ post => {
            if(post) {
                if(post.starts && post.starts[uid]) {
                    post.startCount--;
                    post.starts[uid] = null;
                } else {
                    post.startCount++;
                    if(!post.starts) {
                        post.starts = {};
                    }
                    post.starts[uid] = true;
                }
            }
            return post; /* updated-state */
        })
    }
    function addStar(uid, key) // how to get post-key
    {
        const updates = {};
        updates[`posts/${key}/stars/${uid}`] = true;
        updates[`posts/${key}/starCount`] = database.ServerValue.increment(1); // U/V
        updates[`user-posts/${key}/stars/${uid}`] = true;
        updates[`user-posts/${key}/starCount`] = database.ServerValue.increment(1); // U/V
        return update(ref(database), updates);
    }

}