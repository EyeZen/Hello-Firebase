# Hello Firebase

- [x] This project is clone-started from **Hello Webpack**
- [x] This repo encapsulates firebase examples as given in **Firebase Docs** and more.
- [x] **Firebase Emulator Suite** is used to run the examples
- [x] Currently only contains code for *Firebase Client SDK*

## TODO
- [ ] Add namespace code
- [ ] Add Admin SDK code
- [ ] Add samples
- [ ] Add link to a complete app built in firebase

## Running Webpack
- run `npm run build` to build project
- run `npm run start:dev` to run local development server
- run `npm run start` to run production server

## Installation
- clone repository or download zip
### dependencies installation
- run in root folder: `npm install`
### firebase
- install firebase: `npm install firebase-tools`
- login to firebase `firebase login`
- initialize repo, and select the emulators: `firebase init`
- if already initialized firebase and need to add emulator: `firebase init emulators` and select required emulators, and download emulators

## Running Code
- **required** *installation*
- run webpack-dev-server: `npm run start:dev`
- start firebase emulators: `npm run emulators` or `firebase emulators:start`
- open emulator-ui at `http://localhost:25000`
- open app at `http://localhost:8080`

## Links
- [Firebase Docs][firebase]
- [Firebase Firestore Docs][firestore]
- [Firebase Authentication Docs][auth]
- [Firebase Storage Docs][storage]
- [Firebase Realtime Database Docs][database]
- [Firebase Emulator Suite][emulators]
 
[firebase]: <https://firebase.google.com/docs/build>
[firestore]: <https://firebase.google.com/docs/firestore>
[auth]: <https://firebase.google.com/docs/auth>
[storage]: <https://firebase.google.com/docs/storage>
[database]: <https://firebase.google.com/docs/database>
[emulators]: <https://firebase.google.com/docs/emulator-suite>
