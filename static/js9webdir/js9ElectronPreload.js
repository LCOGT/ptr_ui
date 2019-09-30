/* global require process */

// signal that we are in Electron, rather than the web
window.isElectron = true;
window.currentDir = process.cwd();
// electron version
window.electronVersion = process.versions.electron;
// allow communication back to the renderer
window.electronIPC = require('electron').ipcRenderer;
// pass flag specifying whether multiple instances of the app are running
if( process.env.JS9_MULTIELECTRON === "true" ){
    window.multiElectron = true;
}
