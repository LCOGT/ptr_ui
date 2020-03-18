import helpers from '@/utils/helpers'

var configs = {

    /* TODO: lat-lon temporary fix with hardcoded value. Get these from state. */
    //lat: 34,//$('#static-state').data('lat');
    //lon: -119,//$('#static-state').data('lon');

    config: {
        width: 0,     // Default width, 0 = full parent width; height is determined by projection
        projection: "stereographic",  // Map projection used: airy, aitoff, armadillo, august, azimuthalEqualArea, azimuthalEquidistant, baker, berghaus, boggs, bonne, bromley, collignon, craig, craster, cylindricalEqualArea, cylindricalStereographic, eckert1, eckert2, eckert3, eckert4, eckert5, eckert6, eisenlohr, equirectangular, fahey, foucaut, ginzburg4, ginzburg5, ginzburg6, ginzburg8, ginzburg9, gringorten, hammer, hatano, healpix, hill, homolosine, kavrayskiy7, lagrange, larrivee, laskowski, loximuthal, mercator, miller, mollweide, mtFlatPolarParabolic, mtFlatPolarQuartic, mtFlatPolarSinusoidal, naturalEarth, nellHammer, orthographic, patterson, polyconic, rectangularPolyconic, robinson, sinusoidal, stereographic, times, twoPointEquidistant, vanDerGrinten, vanDerGrinten2, vanDerGrinten3, vanDerGrinten4, wagner4, wagner6, wagner7, wiechel, winkel3
        transform: "equatorial", // Coordinate transformation: equatorial (default), ecliptic, galactic, supergalactic
        center: [helpers.hour2degree(helpers.siderealTime(-119)), 34, 0],       // Initial center coordinates in equatorial transformation [hours, degrees, degrees],
                            // otherwise [degrees, degrees, degrees], 3rd parameter is orientation, null = default center
        follow: "center",   // on which coordinates to center the map, default: zenith, if location enabled, otherwise center

        orientationfixed: true,  // Keep orientation angle the same as center[2]
        //geopos: [34,-119],    // optional initial geographic position [lat,lon] in degrees, overrides center

        background: { fill: "#080f17", stroke: " #17202a", opacity: 1 }, // Background style
        adaptable: true,    // Sizes are increased with higher zoom-levels
        interactive:false, // Enable zooming and rotation with mousewheel and dragging
        form: false,        // Display settings form
        location: true,    // Display location settings
        controls: false,     // Display zoom controls
        lang: "",           // Language for names, so far only for constellations: de: german, es: spanish
                            // Default:en or empty string for english
        container: "celestial-map",   // ID of parent element, e.g. div
        datapath: "/data",  // Path/URL to data files, empty = subfolder 'data'
        stars: {
            show:true,    // Show stars
            limit: 6,      // Show only stars brighter than limit magnitude
            colors: true,  // Show stars in spectral colors, if not use "color"
            style: { fill: "#ffffff", opacity: .5 }, // Default style for stars
            names: false,   // Show star names (Bayer, Flamsteed, Variable star, Gliese, whichever applies first)
            proper: true, // Show proper name (if present)
            desig: false,  // Show all names, including Draper and Hipparcos
            namelimit: 3,  // Show only names for stars brighter than namelimit
            namestyle: { fill: "#ddddbb", font: "10px Georgia, Times, 'Times Roman', serif", align: "left", baseline: "top" },
            propernamestyle: { fill: "#ddddbb", font: "10px Georgia, Times, 'Times Roman', serif", align: "right", baseline: "bottom" },
            propernamelimit: 2,  // Show proper names for stars brighter than propernamelimit
            size: 6,       // Maximum size (radius) of star circle in pixels
            exponent: -0.4, // Scale exponent for star size, larger = more linear
            data: 'stars.6.json' // Data source for stellar data
            //data: 'stars.8.json' // Alternative deeper data source for stellar data
        },
        dsos: {
            show:false,    // Show Deep Space Objects
            limit: 9,      // Show only DSOs brighter than limit magnitude
            names: true,   // Show DSO names
            desig: false,   // Show short DSO names
            namelimit: 10,  // Show only names for DSOs brighter than namelimit
            namestyle: { fill: "#cccccc", font: "9px Helvetica, Arial, serif", align: "left", baseline: "top" },
            size:   6,    // Optional seperate scale size for DSOs, null = stars.size
            exponent: 2, // Scale exponent for DSO size, larger = more non-linear
            data: 'messier.json',  // Data source for DSOs
            //data: 'dsos.6.json'  // Alternative broader data source for DSOs
            //data: 'dsos.14.json' // Alternative deeper data source for DSOs
            symbols: {  //DSO symbol styles
            gg: {shape: "circle", fill: "#ff0000"},                                 // Galaxy cluster
            g:  {shape: "ellipse", fill: "#ff0000"},                                // Generic galaxy
            s:  {shape: "ellipse", fill: "#ff0000", opacity: 0.3},                                // Spiral galaxy
            s0: {shape: "ellipse", fill: "#ff0000", opacity: 0.3},                                // Lenticular galaxy
            sd: {shape: "ellipse", fill: "#ff0000", opacity: 0.3},                                // Dwarf galaxy
            e:  {shape: "ellipse", fill: "#ff0000", opacity: 0.3},                                // Elliptical galaxy
            i:  {shape: "ellipse", fill: "#ff0000", opacity: 0.3},                                // Irregular galaxy
            oc: {shape: "circle", fill: "#ffcc00", stroke: "#ffcc00", width: 1.0},  // Open cluster
            gc: {shape: "circle", fill: "#ff9900", opacity: 0.4},                                 // Globular cluster
            en: {shape: "square", fill: "#ff00cc"},                                 // Emission nebula
            bn: {shape: "square", fill: "#ff00cc", stroke: "#ff00cc", width: 2},    // Generic bright nebula
            sfr:{shape: "square", fill: "#cc00ff", stroke: "#cc00ff", width: 2},    // Star forming region
            rn: {shape: "square", fill: "#00ooff", opacity: 0.3},                                 // Reflection nebula
            pn: {shape: "diamond", fill: "#00cccc", opacity: 0.5},                                // Planetary nebula
            snr:{shape: "diamond", fill: "#ff00cc", opacity: 0.3},                                // Supernova remnant
            dn: {shape: "square", fill: "#999999", stroke: "#999999", width: 2},    // Dark nebula grey
            pos:{shape: "marker", fill: "#cccccc", stroke: "#cccccc", width: 1.5}   // Generic marker
            }
        },
        constellations: {
            show: false,    // Show constellations
            names: false,   // Show constellation names
            desig: false,   // Show short constellation names (3 letter designations)
            namestyle: { fill:"#cccc99", align: "center", baseline: "middle", opacity:0.8,
                            font: ["bold 14px Helvetica, Arial, sans-serif",  // Different fonts for brighter &
                                                "bold 12px Helvetica, Arial, sans-serif",  // sdarker constellations
                                                        "bold 11px Helvetica, Arial, sans-serif"]},
            lines: false,   // Show constellation lines
            linestyle: { stroke: "#cccccc", width: 1, opacity: 0.6 },
            bounds: false,  // Show constellation boundaries
            boundstyle: { stroke: "#cccc00", width: 0.5, opacity: 0.8, dash: [2, 4] }
        },
        planets: {
            show:true,
            which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"],
            // Font styles for planetary symbols
            style: { fill: "#00ccff", font: "bold 17px 'Lucida Sans Unicode', Consolas, sans-serif",
                    align: "center", baseline: "middle" },
            symbols: {  // Character and color for each symbol in 'which', simple circle \u25cf
            "sol": {symbol: "\u2609", fill: "#ffff00"},
            "mer": {symbol: "\u263f", fill: "#cccccc"},
            "ven": {symbol: "\u2640", fill: "#eeeecc"},
            "ter": {symbol: "\u2295", fill: "#00ffff"},
            "lun": {symbol: "\u25cf", fill: "#ffffff"}, // overridden by generated cresent
            "mar": {symbol: "\u2642", fill: "#ff9999"},
            "cer": {symbol: "\u26b3", fill: "#cccccc"},
            "ves": {symbol: "\u26b6", fill: "#cccccc"},
            "jup": {symbol: "\u2643", fill: "#ff9966"},
            "sat": {symbol: "\u2644", fill: "#ffcc66"},
            "ura": {symbol: "\u2645", fill: "#66ccff"},
            "nep": {symbol: "\u2646", fill: "#6666ff"},
            "plu": {symbol: "\u2647", fill: "#aaaaaa"},
            "eri": {symbol: "\u25cf", fill: "#eeeeee"}
            }
        },
        mw: {
            show: true,    // Show Milky Way as filled polygons
            style: { fill: "#fef9e7", opacity:0.10}
        },
        lines: {
            graticule: { show: true, stroke: "#cccccc", width: 0.3, opacity: 0.4,      // Show graticule lines
                    // grid values: "outline", "center", or [lat,...] specific position
            lon: {pos: ["center"], fill: "#aaa", font: "10px Helvetica, Arial, sans-serif"},
                    // grid values: "outline", "center", or [lon,...] specific position
                lat: {pos: ["center"], fill: "#aaa", font: "10px Helvetica, Arial, sans-serif"}},
            equatorial: { show: false, stroke: "#aaaaaa", width: 1.3, opacity: 0.4 },    // Show equatorial plane
            ecliptic: { show: false, stroke: "#66cc66", width: 1.3, opacity: 0.7 },      // Show ecliptic plane
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
            show: false,
            fill: "#fff",
            opacity: 0.4
            }
    },
    spectral_bv: {
        'O5': -0.33,
        'O9': -0.31,
        'B0': -0.30,
        'B2': -0.24,
        'B5': -0.17,
        'B8': -0.11,
        'A0': -0.02,
        'A2': 0.05,
        'A5': 0.15,
        'F0': 0.30,
        'F2': 0.35,
        'F5': 0.44,
        'F8': 0.52,
        'G0': 0.58,
        'G2': 0.63,
        'G5': 0.68,
        'G8': 0.74,
        'K0': 0.81,
        'K2': 0.91,
        'K5': 1.15,
        'M0': 1.40,
        'M2': 1.49,
        'M5': 1.64
    },

    nebula: ['Pl','Di','Bn','Dn', 'Sn'],
    galaxies: ['Cg','Sp','Ba','Ir','El','Ln','Px','Sx'],
    stars: ['Ds', '**', 'star'],

    // Object style data
    default_object_styles: {
        name: "default",
        point: {
            stroke: "rgba(243,156,18,1)",
            width: 1,
        },
        galaxy: {
            fill: "rgba(231,76,60,0.8)",
            width: 1,
            opacity: 0.5,
            namestyle: { fill: "rgb(231,76,60)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        nebula: {
            shape: "diamond",
            fill: "rgba(243,156,18,1)",
            width: 2,
            opacity: 0.8,
            namestyle: { fill: "rgba(245,176,65,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        globular_cluster: {
            opacity: 1,
            stroke: "rgba(72,201,176,1)",
            width: 1,
            namestyle: { fill: "rgba(72,201,176,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        open_cluster: {
            stroke: "rgba(142,68,173)",
            width: 1,
            namestyle: { fill: "rgb(142,68,173)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        star: {
            namestyle: { fill: "#ddddbb", font: "9px Georgia, Times, 'Times Roman', serif", align: "left", baseline: "top" },
            fill: '#ffffff',
            opacity: 1
        },
        crosshair: {
            width: 1.5,
            //stroke:"#e74c3c"
            stroke: '#df2437'
            //stroke: "#48c9b0"
        }
    },

    night_colors_status: 'off',

    red_obj_styles: {
        name: "red",
        point: {
            stroke: "rgba(243,40,18,1)",
            width: 1,
        },
        galaxy: {
            fill: "rgba(231,76,60,0.8)",
            width: 1,
            opacity: 0.5,
            namestyle: { fill: "rgb(231,76,60)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        nebula: {
            shape: "diamond",
            fill: "rgba(194,24,7,1)",
            width: 2,
            opacity: 0.8,
            namestyle: { fill: "rgba(194,24,7,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        globular_cluster: {
            opacity: 1,
            stroke: "rgba(237,41,57,1)",
            width: 1,
            namestyle: { fill: "rgba(237,41,57,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        open_cluster: {
            stroke: "rgba(150,0,24,1)",
            width: 1,
            namestyle: { fill: "rgb(150,0,24,1)", font: "14px Helvetica, Arial, serif", align: "left", baseline: "top" }
        },
        star: {
            namestyle: { fill: "#aa1111", font: "9px Georgia, Times, 'Times Roman', serif", align: "left", baseline: "top" },
            fill: '#aa1111',
            opacity: 1
        },
        crosshair: {
            width: 1.5,
            //stroke:"#e74c3c"
            stroke: '#df2437'
            //stroke: "#48c9b0"
        }
    },

    red_chart_styles: {
        background: { fill: "#000", stroke: "#200808", width: 2, opacity: 1 },
        mw: { style: { fill: "#ff2222", opacity: 0.05 }},
        lines: {
            graticule: { show: true, stroke: "#cccccc", width: 0.3, opacity: 0.5,      // Show graticule lines
            lon: {pos: ["center"], fill: "#a77", font: "10px Helvetica, Arial, sans-serif"},
                    // grid values: "outline", "center", or [lon,...] specific position
                lat: {pos: ["center"], fill: "#a77", font: "10px Helvetica, Arial, sans-serif"}},
        }
    },
    //b-v color index to rgb color value scale
    bvcolor:
        d3.scale.quantize().domain([3.347, -0.335]) //main sequence <= 1.7
        .range(['#ff4700', '#ff4b00', '#ff4f00', '#ff5300', '#ff5600', '#ff5900', '#ff5b00', '#ff5d00', '#ff6000', '#ff6300', '#ff6500', '#ff6700', '#ff6900', '#ff6b00', '#ff6d00', '#ff7000', '#ff7300', '#ff7500', '#ff7800', '#ff7a00', '#ff7c00', '#ff7e00', '#ff8100', '#ff8300', '#ff8506', '#ff870a', '#ff8912', '#ff8b1a', '#ff8e21', '#ff9127', '#ff932c', '#ff9631', '#ff9836', '#ff9a3c', '#ff9d3f', '#ffa148', '#ffa34b', '#ffa54f', '#ffa753', '#ffa957', '#ffab5a', '#ffad5e', '#ffb165', '#ffb269', '#ffb46b', '#ffb872', '#ffb975', '#ffbb78', '#ffbe7e', '#ffc184', '#ffc489', '#ffc78f', '#ffc892', '#ffc994', '#ffcc99', '#ffce9f', '#ffd1a3', '#ffd3a8', '#ffd5ad', '#ffd7b1', '#ffd9b6', '#ffdbba', '#ffddbe', '#ffdfc2', '#ffe1c6', '#ffe3ca', '#ffe4ce', '#ffe8d5', '#ffe9d9', '#ffebdc', '#ffece0', '#ffefe6', '#fff0e9', '#fff2ec', '#fff4f2', '#fff5f5', '#fff6f8', '#fff9fd', '#fef9ff', '#f9f6ff', '#f6f4ff', '#f3f2ff', '#eff0ff', '#ebeeff', '#e9edff', '#e6ebff', '#e3e9ff', '#e0e7ff', '#dee6ff', '#dce5ff', '#d9e3ff', '#d7e2ff', '#d3e0ff', '#c9d9ff', '#bfd3ff', '#b7ceff', '#afc9ff', '#a9c5ff', '#a4c2ff', '#9fbfff', '#9bbcff']),
    starbase: () => this.config.stars.size,
    starexp: () => this.config.stars.exponent,
    starSize: function (d) {
        var mag = d.properties.mag;
        if (mag === null) return 0.1;
        var r = this.starbase * Math.exp(this.starexp * (mag + 2));
        return Math.max(r, 0.1);
    },
}

export default configs