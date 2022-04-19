console.log("firebase/storage");

import { storage } from "./firebase";
import {
    connectStorageEmulator,
    deleteObject,
    getBlob,
    getBytes,
    getDownloadURL,
    getMetadata,
    getStream,
    list,
    listAll,
    ref,
    updateMetadata,
    uploadBytes,
    uploadBytesResumable,
    uploadString,
} from "firebase/storage";
import { FirebaseError } from "firebase/app";
import { doc } from "firebase/firestore";

connectStorageEmulator(storage, "localhost", 25003);
///////////////////////
//    refs basics    //
///////////////////////
const storageRef = ref(storage);
// not-allowed-in-ref: \n,\f,...,#,[,],*,?
// file pointed to by a ref need not exist
const spaceRef = ref(storage, "images/space.jpg");
// same as: ref(storage, 'images')
const imagesRef = spaceRef.parent;
// same as: ref(storage), rootRef.parent = null
const rootRef = spaceRef.root;
const nullRef = rootRef.parent;
// chained refs
const earthRef = ref(spaceRef.parent, "earth.jpg");

// ref: properties
spaceRef.fullPath; // 'images/space.jpg', max-lenght: 1024
spaceRef.name; // 'space.jpg'
spaceRef.bucket; // storage-bucket-name

///////////////////////
//     unrelated     //
///////////////////////

// document.body.innerHTML += `
// <label for="filesInput">filesInput</label>
// <input
//     type="file"
//     name="filesInput"
//     id="filesInput" multiple
//     accept="image/*"
//     onChange='handleFiles'
//     />
// <div id="numInput">numInput</div>
// <div id="inputSize">inputSize</div>
// `;
// const filesInput = document.getElementById('filesInput');
setupDragDrop("dropbox");
function setupDragDrop(elemId) {
    const elem = document.getElementById(elemId);
    elem.addEventListener(
        "dragenter",
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            elem.dataset.placeholder = "Drag Enter";
        },
        false
    );
    elem.addEventListener(
        "dragover",
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            elem.dataset.placeholder = "Drag Over";
        },
        false
    );
    elem.addEventListener("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();
        elem.dataset.placeholder = "Drop";

        const dat = e.dataTransfer;
        const files = dat.files;
        handleFiles(files);
    });
}
setupTextArea("rawstring");
function setupTextArea(elemId) {
    const div = document.createElement("div");
    div.setAttribute("id", `${elemId}-container`);

    const elem = document.createElement("textarea");
    elem.setAttribute("id", elemId);
    elem.value = elemId;

    const btn = document.createElement("button");
    btn.textContent = "Upload Text";

    div.appendChild(btn);
    div.appendChild(elem);
    document.body.appendChild(div);

    btn.addEventListener("click", () => {
        const rawStringElem = document.getElementById(elemId);
        for (let i = 0; i < onUploadText.length; i++) {
            onUploadText[i](rawStringElem.value);
        }
        console.log("raw-string-uploaded");
    });
    document.body.appendChild(elem);
}
const onUploadText = [];

// add functions to this array, to pass input-files array
const onFilesInput = [];
function handleFiles(files) {
    let nBytes = 0,
        oFiles = files,
        nFiles = oFiles.length;
    for (let nFileId = 0; nFileId < nFiles; nFileId++) {
        nBytes += oFiles[nFileId].size;
    }
    let sOutput = nBytes + " bytes";
    const aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    for (
        let nMultiple = 0, nApprox = nBytes / 1024;
        nApprox > 1;
        nApprox /= 1024, nMultiple++
    ) {
        sOutput = `${nApprox.toFixed(3)} ${
            aMultiples[nMultiple]
        } (${nBytes} bytes)`;
    }
    console.log({ nFiles, sOutput });

    for (let i = 0; i < onFilesInput.length; i++) {
        onFilesInput[i](files, { nFiles, sOutput });
    }
}

////////////////////////
//    upload files    //
////////////////////////
// onFilesInput.push(uploadAllFiles);
function uploadAllFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imagesRef = ref(storage, "images");
        if (file.type.startsWith("image")) {
            const fileRef = ref(imagesRef, file.name);
            uploadBytes(fileRef, file)
                .then((snapshot) =>
                    console.log(`${file.name} uploaded to ${fileRef.fullPath}`)
                )
                .catch((err) => {
                    console.error(`error-uploading file ${file.name}: ${err}`);
                });
        }
    }
}

// onFilesInput.push(uploadFilesWithProgress);
function uploadFilesWithProgress(files) {
    for (const file of files) {
        console.log("uploading ", file.name);
        const filesRef = ref(storage, "files");
        const fileRef = ref(filesRef, file.name);
        const uploadTask = uploadBytesResumable(fileRef, file);

        // assign state-change observer
        uploadTask.on(
            "state_change",
            // listener
            (snapshot) => {
                console.log({
                    transferred: snapshot.bytesTransferred,
                    total: snapshot.totalBytes,
                });
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes
                        ? snapshot.totalBytes
                        : 1) * 100;
                console.log("upload is " + progress + "% done");
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                }
            },
            // error-callback
            (err) => {
                console.error("error while uploading " + file.name);
                switch (err.code) {
                    case "storage/unauthorized":
                        console.error(
                            "user does not have permission to access storage"
                        );
                        break;
                    case "storage/canceled":
                        console.error("upload canceled");
                        break;
                    case "storage/unknown":
                        console.error(
                            "unknown error, inspect err.serverResponse"
                        );
                        break;
                    default:
                        console.error(err);
                }
            },
            // success-callback
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at: ", downloadURL);
                });
            }
        );

        // pause the upload
        if (uploadTask.pause()) {
            setTimeout(() => {
                // resume the upload
                if (!uploadTask.resume()) {
                    // cancel the upload
                    uploadTask.cancel();
                }
            }, 5000);
        } else {
            // cancel the upload
            uploadTask.cancel();
        }
    }
}

// onUploadText.push(uploadMessage);
function uploadMessage(msg) {
    const msgRef = ref(storage, "messages");
    uploadString(msgRef, msg)
        .then(() => console.log(`uploaded ${msg}`))
        .catch((err) => console.error(err));
}

/////////////////////////////
//     Download files      //
/////////////////////////////

// direct-download-url
// add callbacks( downloaders ) to array

const onRequestDownload = [];
/*
const imgurl = document.createElement("input");
imgurl.setAttribute("type", "text");
imgurl.setAttribute("value", "images/");
const imgbtn = document.createElement("button");
imgbtn.textContent = "Download";
imgbtn.addEventListener("click", () => {
    for (const callback of onRequestDownload) {
        callback(imgurl.value);
    }
});
document.body.append(imgurl, imgbtn);
*/

// onRequestDownload.push(directDownloadFromURL);
function directDownloadFromURL(url) {
    const urlRef = ref(storage, url);

    console.log("attempting to download", urlRef.fullPath);

    getDownloadURL(urlRef)
        .then((downloadURL) => {
            // download directly
            const xhr = new XMLHttpRequest();
            xhr.responseType = "blob";
            xhr.onload = (event) => {
                const blob = xhr.response;
            };
            xhr.open("GET", downloadURL);
            xhr.send();

            // insert into <img> element
            const img = document.createElement("img");
            img.id = "myimg";
            img.setAttribute("src", downloadURL);
            document.body.appendChild(img);
        })
        .catch((err) => {
            console.error("direct-download-error:", err);
        });
}

// requires storage-cors enabled
// onRequestDownload.push(directDownloadData);
function directDownloadData(source) {
    const img = document.createElement("img");
    img.setAttribute("id", "myimg");

    const resourceRef = ref(storage, source);
    console.log("attempting to download", resourceRef.fullPath);

    // - for nodejs
    // const resStream = getStream(resourceRef);
    // - for browsers
    // getBlob(resourceRef).then(data=>{...})
    // - ...
    // getBytes(resourceRef).then(data=>{...})

    getBlob(resourceRef)
        .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            img.src = blobUrl;
            console.log(resourceRef.name, "downloaded!");
            document.body.appendChild(img);
        })
        .catch((err) => {
            console.error("direct-data-download-error:");
            switch (err.code) {
                case "storage/object-not-found":
                    console.error(resourceRef.fullPath, "file does not exist!");
                    break;
                case "storage/unauthorized":
                    console.error(
                        "user does not have permission to access the resource",
                        resourceRef.name
                    );
                    break;
                case "storage/canceled":
                    console.error(resourceRef.name, "download cancelled");
                    break;
                case "storage/unknown":
                    console.error("unknown error, inspect server response");
                default:
                    console.error(err);
            }
        });
}

///////////////////////////
//       Meta-Data       //
///////////////////////////
// onRequestDownload.push(handleMetadata);
function handleMetadata(source) {
    console.log('meta-data operations on ' + source);
    const resRef = ref(storage, source);
    getMetadata(resRef)
        .then(metadata => {
            console.log('fetched-metadata')
            console.log(metadata);
        })
        .catch(err=>{
            console.error('meta-data fetch-error:',err);
        })
    
    const newMetadata = {
        cacheControl: 'public, max-age=300',
        contentType: 'image/jpeg',
        // contentType: null // delete metadata property
        customMetadata: {
            'thing': 'random-image',
            'reason': 'bored'
        }
    };
    updateMetadata(resRef, newMetadata)
        .then(metadata => {
            console.log('meta-data updated!')
            console.log(metadata);
        })
        .catch(err=>console.error('meta-data update-error:',err));
}

////////////////////////
//    Delete Files    //
////////////////////////

// onRequestDownload.push(deleteFile);
function deleteFile(source) {
    console.log('attempting to delete ' + source);
    const resRef = ref(storage, source);
    deleteObject(resRef)
        .then(()=>{
            console.log(resRef.name + ' deleted!');
        })
        .catch(err => {
            console.error('delete-error:', err);
        })
}

//////////////////////////
//      List Files      //
//////////////////////////

// onRequestDownload.push(lsDir);
function lsDir(prefixName, parent=null, levelPad='') {
    if(parent === null) { parent = storage; }
    const prefRef = ref(parent, prefixName);

    console.log('\n', levelPad + prefRef.fullPath);
    listAll(prefRef)
        .then(res => {
            console.log('res:',res);
            res.prefixes.forEach(folderRef => {
                const thisLevelPad = levelPad + '>';
                console.log(thisLevelPad, folderRef.fullPath);
                // lsDir(folderRef, prefRef, thisLevelpad); // recursive-listing-folder
            })
            res.items.forEach(itemRef=>{
                const thisLevelPad = levelPad + '=';
                console.log(thisLevelPad, itemRef.fullPath);
                // recursive-listing items does not return anything, (empty-result)
            })
        })
        .catch(err => {
            console.error('list-all-error:', err);
        })
}
// paginated list
// onRequestDownload.push(lsDirLimit);
async function lsDirLimit(prefixName, limit=2) {
    
    const prefRef = ref(storage, prefixName);
    console.log(prefRef.fullPath);
    // first batch of 'limit' elements in list
    const firstPage = await list(prefRef, { maxResults: limit });
    console.log('page-1:')
    // use result:
    // firstPage.items
    firstPage.items.forEach(item=>console.log('=',item.fullPath));
    // firstPage.prefixes
    firstPage.prefixes.forEach(folder=>console.log('>',folder.fullpath));

    // fetch next 'limit' items, if present
    if(firstPage.nextPageToken) {
        const nextPage = await list(prefRef, {
            maxResults: limit,
            pageToken: firstPage.nextPageToken,
        });
        console.log('page-next');
        // use result:
        // nextPage.items
        nextPage.items.forEach(item=>console.log('=',item.fullPath));
        // nextPage.prefixes
        nextPage.prefixes.forEach(folder=>console.log('>',folder.fullPath));
    }

    //general-form:

    /*
        const prefRef = ref(storage, prefixName);
        let nextPageToken = null;
        let thisPage = null;
        let i = 0;
        do {

            thisPage = await list(prefRef, { maxResults: limit, pageToken:  nextPageToken});
            console.log(`Page-${i}`);
            thisPage.items.forEach(item=>console.log('=',item.fullPath));
            thisPage.prefixes.forEach(folder=>{
                console.log('>',folder.fullPath);
                lsDirLimit(folder.fullPath, limit);
            });
            i++;
            nextPageToken = thisPage.nextPageToken;
        } while( thisPage.nextPageToken )
    */

    // Handle errors 
}


//////////////////////
// Helper Functions //
//////////////////////

// helper
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for(let i=0; i < len; i++) {
        binary += String.fromCharCode( bytes[i] );
    }
    return window.btoa( binary );
}