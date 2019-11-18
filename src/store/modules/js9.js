
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

    // Helper function for finding max in an array. 
    // Note: Math.max(...large_array) runs out of memory for large arrays.
    function findmax(array) {
        var max = 0,
            a = array.length,
            counter

        for (counter=0;counter<a;counter++) {
            if (array[counter] > max) {
                max = array[counter]
            }
        }
        return max 
    }

    function drawCrosshairCuts(im, ipos, evt){
        if( im && im.crosshair && im.params.crosshair && evt.key=="Shift" ){
            console.log(evt)

            // Select the divs that will contain the plots.
            let xOutDiv = document.getElementById("js9-x-profile")
            let yOutDiv = document.getElementById("js9-y-profile")

            // Get data from the displayed image.
            let obj = JS9.GetImageData(true)

            // These arrays are plotted by flot
            let xdata = []
            let ydata = []

            // Used if we want to plot the median of chunks of data (eg. each point is a median of five values, and is five times faster.)
            let bin = []
            let medianVal 

            // Integerized coorindates of crosshair in the display
            let iposX = Math.floor(ipos.x - 0.5)
            let iposY = Math.floor(ipos.y - 0.5)

            // Indices for x and y representing the js9 canvas.
            let x, y

            // Indices for x and y relative to the image start.
            let imX, imY

            // Compute X profile
            // Iterate over width of the display (dwidth)
            for ( x = 0;  x < obj.dwidth; x+=1 ) {

                // Convert each display position to an image position where 0 
                // is the start of the image
                //
                // For example, if the image is centered and smaller than the 
                // display window, the edge of the display (point 0,0) will 
                // have a negative image position value. 
                imX = JS9.DisplayToImagePos({x:x, y:0}).x

                // The plot should have a value of 0 anywhere outside the image
                if (imX < 0 || imX > obj.width) {
                    bin.push(0)

                // Otherwise return the image value at that position
                } else {
                    bin.push(obj.data[Math.floor(imX+0.5) + (iposY*obj.width)])  
                }

                // Get the median of the surrounding pixels
                let numberToMedianize = 1
                if (x % numberToMedianize == 0) {
                    medianVal = quickselect_median(bin)
                    xdata.push([x,medianVal]);
                    bin = []
                }
            }

            // Compute Y profile like we did for X
            bin = []
            for ( let y = 0;  y < obj.dheight; y+=1 ) {
                imY = JS9.DisplayToImagePos({x:0, y:y}).y
                if (imY < 0 || imY > obj.height) bin.push(0);
                else bin.push(obj.data[iposX+(Math.floor(imY+0.5)*obj.width)])
                let numberToMedianize = 1
                if (y % numberToMedianize == 0) {
                    medianVal = quickselect_median(bin)
                    ydata.push([y, medianVal]);
                    bin = []
                }
            }

            let xOpts = {
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
                markings: [ 
                    { 
                        xaxis: {
                            from:JS9.ImageToDisplayPos({x: iposX, y:0}).x, 
                            to: JS9.ImageToDisplayPos({x: iposX, y:0}).x
                        }, 
                        color: "rgba(0,255,0,0.5)", 
                        lineWidth: 2, 
                        opacity: 0.3,
                    }
                ],
            },
            yaxis: {
                show: false,
                min: 0,
                max: findmax(obj.data)
            },
            xaxis: {
                show: false,
            },
            }

            let yOpts = {
            zoomStack: true,
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
                markings: [ 
                    { 
                        xaxis: {
                            from:JS9.ImageToDisplayPos({x:0, y:iposY}).y, 
                            to: JS9.ImageToDisplayPos({x:0, y:iposY}).y
                        }, 
                        color: "rgba(0,255,0,0.5)", 
                        lineWidth: 2, 
                        opacity: 0.3,
                    }
                ],
            },
            yaxis: {
                show: false,
                min: 0,
                max: findmax(obj.data),
            },
            xaxis: {
                show: false,
            },
            }
            $.plot(xOutDiv, [xdata], xOpts);
            $.plot(yOutDiv, [ydata], yOpts);
        }
    }

    JS9.RegisterPlugin("MyPlugins", "CrosshairCut",
          function(){},
          {onkeyup: drawCrosshairCuts, winDims: [0, 0]});


// initial state
const state = {
    js9Ready: false,
    JS9_ID: 'myJS9',
    instanceIsVisible: false,
    js9_current_image: '',
    current_image_id: '',
    js9Width: '',
    js9Height: '',
    js9Zoom: '',
    crosshairActive: false,
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

    // Use this action to ensure js9 is ready to go
    // Either returns true, or waits for the event and then returns true. 
    waitForJs9Ready({ commit, state }) {
        return new Promise((resolve, reject) => {

            if (state.js9Ready) { console.log('js9 already ready'); console.log(JS9.readied); resolve(true) }
            else if (JS9.readied) { console.log('js9 already ready'); commit('js9Ready', true); resolve(true); }
            else {
                console.log('js9 not ready yet, waiting for event...')
                $(document).on("JS9:ready", () => {
                    console.log('js9 ready event recieved.')
                    commit('js9Ready', true)
                    resolve(true)
                })
            }
        })
    },
    //async waitForJs9Ready({ commit, state }) {

            //if (state.js9Ready) { console.log('js9 already ready'); console.log(JS9.readied);return true; }
            //else if (JS9.readied) { console.log('js9 already ready'); commit('js9Ready', true); return true; }
            //else {
                //console.log('js9 not ready yet, waiting for event...')
                //$(document).on("JS9:ready", () => {
                    //console.log('js9 ready event recieved.')
                    //commit('js9Ready', true)
                    //return true;
                //})
            //}
    //},

    async loadImage({ rootState, state, commit, dispatch }, { base_filename, site, zoom }) {

        console.log('awaiting js9ready')
        await dispatch('waitForJs9Ready')
        console.log('done awaiting js9ready')

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
    js9Ready(state, val) { state.js9Ready = val },
    JS9_ID(state, id) { state.JS9_ID = id },
    instanceIsVisible(state, vis) { state.instanceIsVisible = vis },
    js9_current_image(state, base_filename ) { state.js9_current_image = base_filename },
    current_image_id(state, id) { state.current_image_id = id},
    js9Width(state,val) { state.js9Width = val },
    js9Height(state,val) { state.js9Height = val },
    js9Zoom(state, val) { state.js9ZOom = val },
    crosshairActive(state, val) {state.crosshairActive = val}
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}