
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

let JS9Helpers = {}

try {
    JS9Helpers.drawCrosshairCuts = function(im, ipos, evt){
        if( im && im.crosshair && im.params.crosshair && evt.key=="Shift" ){

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

    // Registers our plugin so the crosshair cuts are plotted whenever the crosshairs change.
    JS9.RegisterPlugin("MyPlugins", "CrosshairCut",
            function(){},
            {onkeyup: JS9Helpers.drawCrosshairCuts, winDims: [0, 0]});

} catch(e) {
    console.warn(e)
}

export default JS9Helpers;
