
import { API } from 'aws-amplify'

    function quickselect_median(arr) {
    const L = arr.length, halfL = L/2;
    if (L % 2 == 1)
        return quickselect(arr, halfL);
    else
        return 0.5 * (quickselect(arr, halfL - 1) + quickselect(arr, halfL));
    }

    function quickselect(arr, k) {
    // Select the kth element in arr
    // arr: List of numerics
    // k: Index
    // return: The kth element (in numerical order) of arr
    if (arr.length == 1)
        return arr[0];
    else {
        const pivot = arr[0];
        const lows = arr.filter((e)=>(e<pivot));
        const highs = arr.filter((e)=>(e>pivot));
        const pivots = arr.filter((e)=>(e==pivot));
        if (k < lows.length) // the pivot is too high
            return quickselect(lows, k);
        else if (k < lows.length + pivots.length)// We got lucky and guessed the median
            return pivot;
        else // the pivot is too low
            return quickselect(highs, k - lows.length - pivots.length);
    }
    }

    function docut(im, ipos, evt){
        if( im && im.crosshair && im.params.crosshair /*&& evt.shiftKey*/ ){

            let xOutDiv = document.getElementById("js9-x-profile")

            let obj = JS9.GetImageData(true)

            let xdata = []
            let bin = []
            let val
            for ( let x = 0;  x < obj.width; x+=1 ) {
                //xdata.push([x, obj.data[x*obj.width + Math.floor(ipos.y-0.5)]]);
                bin.push(obj.data[x + Math.floor(ipos.y)*obj.width])  
                if (x % 1 == 0) {
                    val = quickselect_median(bin)
                    xdata.push([x, val]);
                    bin = []
                }
            }
            let opts = {
            zoomStack: true,
            //selection: { mode: "xy" },
            grid: {
                backgroundColor: "#232929",
                margin: {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                },
                borderWidth: 0,
                labelMargin: 0,
                axisMargin: 0,
                minBorderMargin: 0,
                hoverable: true,
                markings: [ { xaxis: {from:Math.floor(ipos.x), to: Math.floor(ipos.x)}, color: "rgba(0,255,0,0.5)", lineWidth: 2, opacity: 0.5,}],
            },
            yaxis: {
                show: false,
                min: 0,
                //max:  obj.data.sort()[obj.data.length-1],
                max:  Array.prototype.slice.call(obj.data).sort()[obj.data.length],
            },
            xaxis: {
                show: false,
            },
            }
            $.plot(xOutDiv, [xdata], opts);
        }
    }

    JS9.RegisterPlugin("MyPlugins", "CrosshairCut",
          function(){},
          {onkeyup: docut, winDims: [0, 0]});


// initial state
const state = {
    JS9_ID: 'myJS9',
    instanceIsVisible: false,
    js9_current_image: '',
    current_image_id: '',
    js9Width: '',
    js9Height: '',
    js9Zoom: '',
}

// getters
const getters = {
    JS9_ID: state => state.JS9_ID,
    instanceIsVisible: state => state.instanceIsVisible,
    js9_current_image: state => state.js9_current_image,
    current_image_id: state => state.current_image_id,
    js9Width: state => state.js9Width,
    js9Height: state => state.js9Height,
}

// actions
const actions = {

    loadImage({ rootState, state, commit }, { base_filename, site, zoom }) {

        // only load if it's not currently loaded.
        if (!base_filename || !site) {
            console.log("Did not load image in js9 due to bad parameters: ")
            console.log({
                "base_filename": base_filename,
                "site": site,
            })
            return;
        } else if (base_filename == state.js9_current_image) {
            console.log("No need to load the same image into js9.")
            return;
        } else {
            let apiName = rootState.dev.active_api;
            let path = `/fits13_url/${site}/${base_filename}/`;

            // This helper function returns only after the current image is loaded.
            function ensureImageLoaded() {
                return new Promise(function (resolve, reject) {
                    (function waitForLoad(){
                        if (JS9.GetLoadStatus() == "complete") return resolve();
                        setTimeout(waitForLoad, 300);
                    })();
                });
            }
            
            API.get(apiName, path).then(async response => {
                console.log('response from loadImage: ',response)
                // Download the image to the browser instance
                JS9.Load(response, {scale: "histeq"}, {display: state.JS9_ID})

                commit('js9_current_image', base_filename)
                console.log(base_filename)

                // Once the image loads, upload the FITS file for server-side capabilities.
                // Wait a bit before checking so we don't get the 'complete' status from the prior image.
                setTimeout(function(){
                    ensureImageLoaded().then(function(){
                    console.log(JS9.GetLoadStatus())
                        JS9.UploadFITSFile()
                        if (zoom) JS9.SetZoom(zoom)
                    })
                }, 500)
            }).catch(error => {
                console.log(error)
            });
        }
    },

    resizeDisplay({ state, commit }, { id, width, height }) {
        // only resize if dimensions are different
        if (state.js9Width==width && state.js9Height==height) {
            return;
        // don't do anything if js9 is not loaded yet
        } else if (!JS9.GetLoadStatus()) {
            console.log("js9 load status was false")
            console.log(JS9.GetLoadStatus())
            return;
        } else {
            // we might later want to adjust the zoom level when the window size changes. 
            let zoom = JS9.GetZoom(id)
            JS9.ResizeDisplay(id, width, height)
            commit('js9Width', width)
            commit('js9Height', height)
        }
    },

    zoom({commit}, zoomLevel) {
        JS9.SetZoom(zoomLevel)
        commit('js9Zoom', zoomLevel)
    }
    
}

// mutations
const mutations = {
    JS9_ID(state, id) { state.JS9_ID = id },
    instanceIsVisible(state, vis) { state.instanceIsVisible = vis },
    js9_current_image(state, base_filename ) { state.js9_current_image = base_filename },
    current_image_id(state, id) { state.current_image_id = id},
    js9Width(state,val) { state.js9Width = val },
    js9Height(state,val) { state.js9Height = val },
    js9Zoom(state, val) { state.js9ZOom = val },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}