console.log('firebase-modular');
// import { map } from '@firebase/util';
// npm install firebase@9.6.10 --save
// import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    connectFirestoreEmulator,
    collection, 
    doc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    query, 
    where,
    orderBy,
    limit,
    getDoc,
    getDocFromCache,
    onSnapshot, 
    arrayUnion, 
    arrayRemove,
    increment,
    deleteDoc,
    deleteField
} from 'firebase/firestore';

import { db } from './firebase';
  
connectFirestoreEmulator(db, 'localhost', 25002);

// getCities(db)
// .then(cities=>console.log(cities))
// .catch(err=>console.error(err));

async function getCities(db) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}

// addCity(db, {
//     name: 'Hiroshima',
//     coutry: 'Japan',
//     capital: false
// });

async function addCity(db, city) {
    try {
        const docRef = await addDoc(collection(db, 'cities'), city);
        console.log('document written with id: ', docRef.id);
    } catch( err ) {
        console.error('Error adding document: ', err);
    }
}

// getOrderedCapitals(db)
// .then(()=>console.log('Order Capitals fetched'))
// .catch(err => console.error(`error fetching orderd capitals: ${err}`))
async function getOrderedCapitals(db) {
    const q = query(
        collection(db, 'cities'),
        where("capital", "==", true),
        orderBy('country', 'asc'),
        orderBy('name', "desc")
        // limit(3)
    );
    const querySnapshot =await getDocs(q);
    querySnapshot.forEach(doc => {
        // doc.data() never undefined for query-snapshot
        console.log(doc.id, ' => ', doc.data());
    });
}

// initializeCities(db)
// .then(()=>console.log("initialized db"))
// .catch(err => console.error('error occured while initializing db', err));
async function initializeCities(db) {
    const citiesRef = collection(db, "cities");

    await setDoc(doc(citiesRef, "SF"), {
        name: "San Francisco", state: "CA", country: "USA",
        capital: false, population: 860000,
        regions: ["west_coast", "norcal"] });
    await setDoc(doc(citiesRef, "LA"), {
        name: "Los Angeles", state: "CA", country: "USA",
        capital: false, population: 3900000,
        regions: ["west_coast", "socal"] });
    await setDoc(doc(citiesRef, "DC"), {
        name: "Washington, D.C.", state: null, country: "USA",
        capital: true, population: 680000,
        regions: ["east_coast"] });
    await setDoc(doc(citiesRef, "TOK"), {
        name: "Tokyo", state: null, country: "Japan",
        capital: true, population: 9000000,
        regions: ["kanto", "honshu"] });
    await setDoc(doc(citiesRef, "BJ"), {
        name: "Beijing", state: null, country: "China",
        capital: true, population: 21500000,
        regions: ["jingjinji", "hebei"] });
}

// getCityByInitials(db, 'SF');
async function getCityByInitials(db, cityNameInits) {
    const docRef = doc(db, 'cities', cityNameInits);
    // for force-fetching form cache
    // await getDocFromCache(docRef);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
        console.log(`City by name "${cityNameInits}":`, docSnap.data());
    } else {
        // doc.data() undefined
        console.log('No such city')
    }
}

// snapshot listeners
function addSnapshotListeners() {
    const unsub = onSnapshot(
        doc(db, 'cities', 'SF'), 
        // { includeMetadataChanges: true }, // optional options
        (doc) => {
        const source = doc.metadata.hasPendingWrites ? 'Local':'Server';
        console.log('Current data:', doc.data());
    });
    unsub();
    
    const q = query(collection(db, "cities"), where("state", "==", "CA"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                console.log("New city: ", change.doc.data());
            }
            if (change.type === "modified") {
                console.log("Modified city: ", change.doc.data());
            }
            if (change.type === "removed") {
                console.log("Removed city: ", change.doc.data());
            }
        });
    },
    (err) => {
        // listener detached on error, no need to unsubscribe!
        console.error('Error occured when listening for snapshot, detaching!');
    });
    unsubscribe();
}

updateDB(db)
.catch(err => {
    console.error(`error updating db: ${err}`);
})
async function updateDB(db) {
    const citiesRef = collection(db, 'cities');

    await Promise.all([
        updateDoc(doc(citiesRef, 'SF'), {
            "landmarks": arrayUnion({
                name: 'Golden Gate Bridge',
                type: 'bridge'
            }),
            "population": increment(50)
        }),
        updateDoc(doc(citiesRef, 'SF'), {
            "landmarks": arrayUnion({
                name: 'Legion of Honor',
                type: 'museum'
            }),
            "population": increment(-50)
        }),
        updateDoc(doc(citiesRef, 'LA'), {
            "landmarks": arrayUnion({
                name: 'Griffith Park',
                type: 'park'
            }),
            "population": increment(-50)
        }),
        updateDoc(doc(citiesRef, 'LA'), {
            "landmarks": arrayUnion({
                name: 'The Getty',
                type: 'museum'
            }),
            "population": increment(50)
        }),
        updateDoc(doc(citiesRef, 'DC'), {
            "landmarks": arrayUnion({
                name: 'Lincoln Memorial',
                type: 'memorial'
            }),
            "population": increment(-50)
        }),
        updateDoc(doc(citiesRef, 'DC'), {
            "landmarks": arrayUnion({
                name: 'National Air and Space Museum',
                type: 'museum'
            }),
            "population": increment(50)
        }),
        updateDoc(doc(citiesRef, 'TOK'), {
            "landmarks": arrayUnion({
                name: 'Ueno Park',
                type: 'park'
            }),
            "population": increment(50)
        }),
        updateDoc(doc(citiesRef, 'TOK'), {
            "landmarks": arrayUnion({
                name: 'National Museum of Nature and Science',
                type: 'museum'
            }),
            "population": increment(-50)
        }),
        updateDoc(doc(citiesRef, 'BJ'), {
            "landmarks": arrayUnion({
                name: 'Jingshan Park',
                type: 'park'
            }),
            "population": increment(-50)
        }),
        updateDoc(doc(citiesRef, 'BJ'), {
            "landmarks": arrayUnion({
                name: 'Beijing Ancient Observatory',
                type: 'museum'
            }),
            "population": increment(50)
        })
    ]);
}

// converting data back-forth using converter
class City {
    constructor (name, state, country ) {
        this.name = name;
        this.state = state;
        this.country = country;
    }
    toString() {
        return this.name + ', ' + this.state + ', ' + this.country;
    }
}

// Firestore data converter
const cityConverter = {
    toFirestore: (city) => {
        return {
            name: city.name,
            state: city.state,
            country: city.country
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new City(data.name, data.state, data.country);
    }
};

// Set with cityConverter
// addCityObj(db, new City("Los Angeles", "CA", "USA"));
async function addCityObj(city) {
    const ref = doc(db, "cities", "LA").withConverter(cityConverter);
    await setDoc(ref, city);
}

// to delete a collection or subcollection, delete all contained documents

getDocs(collection(db, 'cities'), snapshot => {
    snapshot.forEach(doc => deleteCollection(
        collection(db, 'cities', doc.data().id, "landmarks")
    ))
})
.catch(err => {
    console.error(err);
})

// async function iiaaf() {
//     const citiesCol = collection(db, 'cities');
//     const citiesRef = await getDocs(citiesCol);
//     const citiesIdList = citiesRef.docs.map(cities => cities.id);
//     // for...of reads values
//     for(const city of citiesIdList) {
//         const landmarksCol = collection(citiesCol, city, 'landmarks');
//         const landmarksRef = await getDocs(landmarksCol);
//         const landmarksIdList = landmarksRef.docs.map(landmarks => landmarks.id);
//         for(const landmark of landmarksIdList) {
//             await deleteDoc(doc(landmarksCol, landmark));
//         }
//     }
// }
// iiaaf()
// .then(() => { console.log('landmarks deleted'); })
// .catch(err => { console.error('error deleting landmarks', err); })

