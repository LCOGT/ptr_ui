let base_config = {
    width: 0,     // Default width, 0 = full parent width; height is determined by projection
    projection: "stereographic",  // Map projection used: airy, aitoff, armadillo, august, azimuthalEqualArea, azimuthalEquidistant, baker, berghaus, boggs, bonne, bromley, collignon, craig, craster, cylindricalEqualArea, cylindricalStereographic, eckert1, eckert2, eckert3, eckert4, eckert5, eckert6, eisenlohr, equirectangular, fahey, foucaut, ginzburg4, ginzburg5, ginzburg6, ginzburg8, ginzburg9, gringorten, hammer, hatano, healpix, hill, homolosine, kavrayskiy7, lagrange, larrivee, laskowski, loximuthal, mercator, miller, mollweide, mtFlatPolarParabolic, mtFlatPolarQuartic, mtFlatPolarSinusoidal, naturalEarth, nellHammer, orthographic, patterson, polyconic, rectangularPolyconic, robinson, sinusoidal, stereographic, times, twoPointEquidistant, vanDerGrinten, vanDerGrinten2, vanDerGrinten3, vanDerGrinten4, wagner4, wagner6, wagner7, wiechel, winkel3
    projectionRatio: null, // Optional override for default projection ratio
    transform: "equatorial", // Coordinate transformation: equatorial (default), ecliptic, galactic, supergalactic

    // Initial center coordinates in equatorial transformation [hours, degrees, degrees],
    // otherwise [degrees, degrees, degrees], 3rd parameter is orientation, null = default center
    // NOTE: don't set center here; load in component where site lat/lng is known. 
    //center: [helpers.hour2degree(helpers.siderealTime(-119)), 34,],       
    follow: "center",   // on which coordinates to center the map, default: zenith, if location enabled, otherwise center

    orientationfixed: true,  // Keep orientation angle the same as center[2]
    //geopos: [34,-119],    // optional initial geographic position [lat,lon] in degrees, overrides center

    background: { fill: "#080f17", stroke: " #17202a", opacity: 1 }, // Background style
    adaptable: false,    // Sizes are increased with higher zoom-levels
    interactive: false, // Enable zooming and rotation with mousewheel and dragging
    form: false,        // Display settings form
    // Set visiblity for each group of fields of the form
    formFields: {
        location: true,
        general: true,
        stars: true,
        dsos: true,
        constellations: true,
        lines: true,
        other: true,
        download: false
    },
    controls: false,    // Display zoom controls
    lang: "",           // Language for names, so far only for constellations: de: german, es: spanish
                        // Default:en or empty string for english
    container: "celestial-map",   // ID of parent element, e.g. div
    datapath: "/data",  // Path/URL to data files, empty = subfolder 'data'
    stars: {
        show:true,    // Show stars
        limit: 6,      // Show only stars brighter than limit magnitude
        colors: true,  // Show stars in spectral colors, if not use "color"
        style: { fill: "#ffffff", opacity: .7 }, // Default style for stars
        designation: false,  // Show all names, including Draper and Hipparcos
        designationType: "desig", // Which kind of name is displayed as designation (fieldname in starnames.json)
        designationStyle: { fill: "#ddddbb", font: "10px Georgia, Times, 'Times Roman', serif", align: "left", baseline: "top" },
        designationLimit: 4,  // Show only names for stars brighter than nameLimit

        propername: false,   // Show proper name (if present)
        propernameType: "name", // Field in starnames.json that contains proper name; may vary with culture setting
        propernameStyle: { fill: "#ddddbb", font: "10px Georgia, Times, 'Times Roman', serif", align: "right", baseline: "bottom" },
        propernameLimit: 3,  // Show proper names for stars brighter than propernameLimit

        size: 7,       // Maximum size (radius) of star circle in pixels
        exponent: -0.5, // Scale exponent for star size, larger = more linear
        data: 'stars.6.json' // Data source for stellar data
        //data: 'stars.8.json' // Alternative deeper data source for stellar data
    },
    dsos: {
        show: false,    // Show Deep Space Objects
        limit: 9,      // Show only DSOs brighter than limit magnitude
        names: false,   // Show DSO names
        nameLimit: 10,  // Show only names for DSOs brighter than namelimit
        nameType: false,
        nameStyle: { fill: "#cccccc", font: "9px Helvetica, Arial, serif", align: "left", baseline: "top" },
        size: 6,    // Optional seperate scale size for DSOs, null = stars.size
        exponent: 2, // Scale exponent for DSO size, larger = more non-linear
        data: 'messier.json',  // Data source for DSOs
        //data: 'dsos.6.json'  // Alternative broader data source for DSOs
        //data: 'dsos.14.json' // Alternative deeper data source for DSOs
        symbols: {  //DSO symbol styles
            gg: { shape: "circle", fill: "#ff0000" },                                 // Galaxy cluster
            g: { shape: "ellipse", fill: "#ff0000" },                                // Generic galaxy
            s: { shape: "ellipse", fill: "#ff0000", opacity: 0.3 },                                // Spiral galaxy
            s0: { shape: "ellipse", fill: "#ff0000", opacity: 0.3 },                                // Lenticular galaxy
            sd: { shape: "ellipse", fill: "#ff0000", opacity: 0.3 },                                // Dwarf galaxy
            e: { shape: "ellipse", fill: "#ff0000", opacity: 0.3 },                                // Elliptical galaxy
            i: { shape: "ellipse", fill: "#ff0000", opacity: 0.3 },                                // Irregular galaxy
            oc: { shape: "circle", fill: "#ffcc00", stroke: "#ffcc00", width: 1.0 },  // Open cluster
            gc: { shape: "circle", fill: "#ff9900", opacity: 0.4 },                                 // Globular cluster
            en: { shape: "square", fill: "#ff00cc" },                                 // Emission nebula
            bn: { shape: "square", fill: "#ff00cc", stroke: "#ff00cc", width: 2 },    // Generic bright nebula
            sfr: { shape: "square", fill: "#cc00ff", stroke: "#cc00ff", width: 2 },    // Star forming region
            rn: { shape: "square", fill: "#00ooff", opacity: 0.3 },                                 // Reflection nebula
            pn: { shape: "diamond", fill: "#00cccc", opacity: 0.5 },                                // Planetary nebula
            snr: { shape: "diamond", fill: "#ff00cc", opacity: 0.3 },                                // Supernova remnant
            dn: { shape: "square", fill: "#999999", stroke: "#999999", width: 2 },    // Dark nebula grey
            pos: { shape: "marker", fill: "#cccccc", stroke: "#cccccc", width: 1.5 }   // Generic marker
        }
    },
    constellations: {
        show: false,    // Show constellations
        names: false,   // Show constellation names
        namesType: false,   // Show short constellation names (3 letter designations)
        nameStyle: {
            fill: "#cccc99", align: "center", baseline: "middle", opacity: 0.8,
            font: ["bold 14px Helvetica, Arial, sans-serif",  // Different fonts for brighter &
                "bold 12px Helvetica, Arial, sans-serif",  // sdarker constellations
                "bold 11px Helvetica, Arial, sans-serif"]
        },
        lines: false,   // Show constellation lines
        lineStyle: { stroke: "#cccccc", width: 1, opacity: 0.6 },
        bounds: false,  // Show constellation boundaries
        boundStyle: { stroke: "#cccc00", width: 0.5, opacity: 0.8, dash: [2, 4] }
    },
    planets: {
        show: true,
        which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"],
        // Font styles for planetary symbols
        symbolStyle: {
            fill: "#00ccff", font: "bold 17px 'Lucida Sans Unicode', Consolas, sans-serif",
            align: "center", baseline: "middle"
        },
        symbolType: "disk",
        symbols: {  // Character and color for each symbol in 'which', simple circle \u25cf
            "sol": { symbol: "\u2609", letter: "Su", fill: "#ffff00", size: "24" },
            "mer": { symbol: "\u263f", letter: "Me", fill: "#cccccc" },
            "ven": { symbol: "\u2640", letter: "V", fill: "#eeeecc" },
            "ter": { symbol: "\u2295", letter: "T", fill: "#00ccff" },
            "lun": { symbol: "\u25cf", letter: "L", fill: "#ffffff", size: "24" }, // overridden by generated crecent, except letter & size
            "mar": { symbol: "\u2642", letter: "Ma", fill: "#ff6600" },
            "cer": { symbol: "\u26b3", letter: "C", fill: "#cccccc" },
            "ves": { symbol: "\u26b6", letter: "Ma", fill: "#cccccc" },
            "jup": { symbol: "\u2643", letter: "J", fill: "#ffaa33" },
            "sat": { symbol: "\u2644", letter: "Sa", fill: "#ffdd66" },
            "ura": { symbol: "\u2645", letter: "U", fill: "#66ccff" },
            "nep": { symbol: "\u2646", letter: "N", fill: "#6666ff" },
            "plu": { symbol: "\u2647", letter: "P", fill: "#aaaaaa" },
            "eri": { symbol: "\u26aa", letter: "E", fill: "#eeeeee" }
        },
        names: true,
        nameStyle: { fill: "#cccccc", font: "17px 'Lucida Sans Unicode', 'DejaVu Sans'", align: "right", baseline: "top" },
        namesType: "desig",
    },
    mw: {
        show: true,    // Show Milky Way as filled polygons
        style: { fill: "#fef9e7", opacity: 0.10 }
    },
    lines: {
        graticule: {
            show: true, stroke: "#cccccc", width: 0.3, opacity: 0.4,      // Show graticule lines
            // grid values: "outline", "center", or [lat,...] specific position
            lon: { pos: ["outline"], opacity: 0.6, fill: "lightblue", font: "12px Helvetica, Arial, sans-serif" },
            // grid values: "outline", "center", or [lon,...] specific position
            lat: { pos: ["center"], opacity: 0.5, fill: "lightblue", font: "12px Helvetica, Arial, sans-serif" }
        },
        equatorial: { show: false, stroke: "#aaaaaa", width: 1.3, opacity: 0.4 },    // Show equatorial plane
        ecliptic: { show: true, stroke: "#66cc66", width: 1.3, opacity: 0.3 },      // Show ecliptic plane
        galactic: { show: false, stroke: "#cc6666", width: 1.3, opacity: 0.7 },     // Show galactic plane
        supergalactic: { show: false, stroke: "#cc66cc", width: 1.3, opacity: 0.7 } // Show supergalactic plane
        //mars: { show: false, stroke:"#cc0000", width:1.3, opacity:.7 }
    },
    horizon: {  //Show horizon marker, if geo-position and date-time is set
        show: false,
        stroke: "#000099", // Line
        width: 1.0,
        fill: "#000000", // Area below horizon
        opacity: 0.5
    },
    daylight: {  // Show daylight marker (tbi)
        show:false,
        fill: "#fff",
        opacity: 0.4
    }
}

// Object style data
const default_custom_object_styles = {
    name: "default",
    point: {
        stroke: "rgba(243,156,18,1)",
        width: 1,
    },
    galaxy: {
        fill: "rgba(231,76,60,0.8)",
        width: 1,
        opacity: 0.5,
        nameStyle: { 
            fill: "rgba(231,76,60)", 
            font: "14px Helvetica, Arial, serif", 
            align: "left", 
            baseline: "top" 
        },
        nameLimit: 10,
    },
    nebula: {
        shape: "diamond",
        fill: "rgba(243,156,18,1)",
        width: 2,
        opacity: 0.8,
        nameStyle: {
            fill: "rgba(245,176,65,1)",
            font: "14px Verdana, Arial, serif", 
            align: "left", 
            baseline: "top"
        },
        nameLimit: 212,
    },
    globular_cluster: {
        opacity: 1,
        stroke: "rgba(72,201,176,1)",
        width: 1,
        nameStyle: { 
            fill: "rgba(72,201,176,1)", 
            //opacity: 1, 
            font: "14px Helvetica, Arial, serif", 
            align: "left", baseline: "top" 
        },
        nameLimit: 8,
    },
    open_cluster: {
        stroke: "white",
        width: 1,
        nameStyle: { 
            fill: "white", 
            opacity: 1, 
            font: "14px Helvetica, Arial, serif", 
            align: "left", 
            baseline: "top" 
        },
        nameLimit: 5,
    },
    star: {
        nameStyle: { 
            fill: "#ddddbb", 
            font: "9px Georgia, Times, 'Times Roman', serif", 
            align: "left", 
            baseline: "top" 
        },
        fill: '#ffffff',
        opacity: 1,
        nameLimit: 1.5
    },
    crosshair: {
        width: 1.5,
        stroke: '#df2437',
        opacity: 1
    },
    telescope_crosshair: {
        width: 1.5,
        stroke: 'greenyellow'
    }
}

const red_obj_styles = {
    name: "red",
    point: {
        stroke: "rgba(243,40,18,1)",
        width: 1,
    },
    galaxy: {
        fill: "rgba(231,76,60,0.8)",
        width: 1,
        opacity: 0.5,
        nameStyle: { fill: "rgb(231,76,60)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
    },
    nebula: {
        shape: "diamond",
        fill: "rgba(194,24,7,1)",
        width: 2,
        opacity: 0.8,
        nameStyle: { fill: "rgba(194,24,7,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
    },
    globular_cluster: {
        opacity: 1,
        stroke: "rgba(237,41,57,1)",
        width: 1,
        nameStyle: { fill: "rgba(237,41,57,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
    },
    open_cluster: {
        stroke: "rgba(150,0,24,1)",
        width: 1,
        nameStyle: { fill: "rgb(150,0,24,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
    },
    star: {
        nameStyle: { fill: "#aa1111", font: "9px Georgia, Times, 'Times Roman', serif", align: "left", baseline: "top" },
        fill: '#aa1111',
        opacity: 1
    },
    crosshair: {
        width: 1.5,
        //stroke:"#e74c3c"
        stroke: '#df2437'
        //stroke: "#48c9b0"
    }
}

const red_chart_styles = {
    background: { fill: "#000", stroke: "#200808", width: 2, opacity: 1 },
    mw: { style: { fill: "#ff2222", opacity: 0.05 } },
    lines: {
        graticule: {
            show: true, stroke: "#cccccc", width: 0.3, opacity: 0.5,      // Show graticule lines
            lon: { pos: ["center"], fill: "#a77", font: "10px Helvetica, Arial, sans-serif" },
            // grid values: "outline", "center", or [lon,...] specific position
            lat: { pos: ["center"], fill: "#a77", font: "10px Helvetica, Arial, sans-serif" }
        },
    }
}


export {
    base_config,
    default_custom_object_styles,
    red_obj_styles,
    red_chart_styles,
}