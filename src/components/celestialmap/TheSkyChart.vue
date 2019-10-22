<template>
    <div>
        <div id="celestial-map"></div>
        <!-- The following two elements have been moved to the main index.html file.
            This is because we get errors if the elements are missing whenever the
            celestial.js file is included. And they are set to be invisible anyways. -->
        <!--div id="celestial-form" style="display:none;"></div-->
        <!--div id="celestial-date" style="width:0"></div-->
        <button class="button" @click="rotate">recenter</button>
        <!--button class="button" @click="zoom">zoom</button-->
        <!--button class="button" @click="animateZoom">zoom2</button-->
   </div> 
</template>

<script>
import Celestial from '@/components/celestialmap/celestial'
import mapConfigs from '@/components/celestialmap/mapConfigs'
import helpers from '@/utils/helpers'
import { mapGetters } from 'vuex'

export default {
    name: 'TheSkyChart',
    data () {
        return {
            mapClickedX: -1,
            mapClickedY: -1,
        }
    },
    methods: {
        // Handle mouse clicks/moves
        handleClick () {
            let that = this
            document.getElementById("celestial-map").addEventListener('mousedown', function (e) {
                var w = this
                mousemove(e)
                w.addEventListener("mousemove", mousemove)
                w.addEventListener("mouseup", mouseup)

                function mousemove(e) {
                    let dim =w.getBoundingClientRect()
                    let cx = e.clientX - dim['x']
                    let cy = e.clientY - dim['y']
                    let eq = Celestial.mapProjection.invert([cx, cy])
                    eq[0] = helpers.degree2hour(eq[0])

                    that.$store.dispatch('skyChart/setSelected', eq ) 
                    that.update_pointer();
                }

                function mouseup() {
                    w.removeEventListener("mousemove",mousemove);
                }
            })
        },
        // Returns false if an object should not be displayed; otherwise returns true.
        filterChart (object) {
            var type = object.properties.type;
            var mag = object.properties.mag;

            if (this.dso_types.indexOf(type) != -1 &&
                this.dso_mags[0] <= mag &&
                this.dso_mags[1] >= mag) {
                    return true;
                }

            if (this.star_types.indexOf(type) != -1 &&
                this.star_mags[0] <= mag &&
                this.star_mags[1] >= mag) {
                    return true;
                }

            return false;
        },
        initializePointer () {

            var pointers = {
                "type":"FeatureCollection",
                "features":[
                    {"type":"Feature",
                    "id":"pointers",
                    "geometry": {
                        "type":"Point"
                    },
                    "style": {
                        "stroke-width":"0.5",
                        "stroke":"#e74c3c"
                    }}
                ]
            };
            Celestial.add({type:"Point", callback: function(error, json) {
                if (error) return console.warn(error);
                var pointer_data = Celestial.getData(pointers, mapConfigs.config.transform);
                Celestial.container.selectAll(".pointers")
                    .data(pointer_data.features)
                    .enter().append("path")
                    .attr("class", "point");
                Celestial.redraw();
            }, redraw: function() {
                Celestial.container.selectAll(".point").each(function(d) {
                    //Celestial.setStyle(style.crosshair_style);
                    var p_coords = ([helpers.hour2degree(0), 0]);
                    var t_coords = ([helpers.hour2degree(this.mountRa), this.mountDec]);
                    // Limit selectable regions to coordinates on the map with Celestial.clip().
                    if (Celestial.clip(p_coords)) {
                        p_coords = Celestial.mapProjection(p_coords);
                        //Celestial.Canvas.symbol()
                        //.type("marker")
                        //.size(420)
                        //.position(Celestial.mapProjection(p_coords))(Celestial.context);
                        var r = 15;
                        Celestial.context.beginPath();
                        Celestial.context.moveTo(p_coords[0], p_coords[1] - r);
                        Celestial.context.lineTo(p_coords[0], p_coords[1] + r);
                        Celestial.context.moveTo(p_coords[0] - r, p_coords[1]);
                        Celestial.context.lineTo(p_coords[0] + r, p_coords[1]);
                        Celestial.context.closePath();
                        Celestial.context.stroke();
                    }
                    Celestial.Canvas.symbol()
                        .type("cross-circle")
                        .size(220)
                        .position(Celestial.mapProjection(t_coords))(Celestial.context);
                    Celestial.context.stroke();
                });
            } 
            });
        },

        update_chart (filter = mapConfigs.default_filter) {
            var that = this;

            var nebula = ['Pl','Di','Bn','Dn', 'Sn'];
            var galaxies = ['Cg','Sp','Ba','Ir','El','Ln','Px','Sx'];
            var stars = ['Ds', '**', 'star'];


            // Default to normal object symbols on sky chart, or red tones if requested.
            var styles = mapConfigs.default_object_styles;
            if (mapConfigs.night_colors_status == "on") {styles = mapConfigs.red_obj_styles; }
            else if (mapConfigs.night_colors_status != "off") {
                alert("Could not apply requested sky chart style. Reverting to default.");
            }

            Celestial.clear();
            Celestial.add({type:"json", file:"/data/all_objects.json", callback: function(error,json) {
                if (error) {return console.warn(error);}

                var sky_objects = Celestial.getData(json, mapConfigs.config.transform);

                Celestial.container.selectAll(".custom_objects")
                    .data(sky_objects.features)
                    .enter().append("path")
                    .attr("class", "custom_obj");
                Celestial.redraw();
            }, redraw: function() {
                Celestial.container.selectAll(".custom_obj").each(function (d) {
                    if (Celestial.clip(d.geometry.coordinates)/* && filterChart(d)*/) {
                    //if (true) {
                        var pt = Celestial.mapProjection(d.geometry.coordinates),
                            type = d.properties.type,
                            mag = d.properties.mag,
                            m = d.properties.messier;
                            //size = d.properties.size;

                        //Celestial.context.fillStyle = "#fff";
                        if (stars.indexOf(type) !== -1) {
                            var starstyle = styles.star;
                            Celestial.setStyle(starstyle)

                            // Apply spectral star colors unless we're in red mode.
                            if (d.properties.spectral && styles.name != "red") {
                                var bv = mapConfigs.spectral_bv[d.properties.spectral.slice(0,2)];
                                Celestial.context.fillStyle = mapConfigs.bvcolor(bv);
                            }
                            var r = mapConfigs.starSize(d);
                            Celestial.context.beginPath();
                            Celestial.context.arc(pt[0], pt[1], r, 0, 2 * Math.PI);
                            Celestial.context.closePath();
                            Celestial.context.fill();
                            if (mag < 1.5) {
                                Celestial.setTextStyle(styles.star.namestyle);
                                Celestial.context.fillText(d.properties.name, pt[0]+r, pt[1]-r);
                            }
                        }
                        else if (galaxies.indexOf(type) !== -1) {
                            styles.galaxy.opacity = Math.pow((3.0/mag),1.5)/2 + 0.5;
                            Celestial.setStyle(styles.galaxy);
                            var s = 9;
                            var r = s / Math.sqrt(3);
                            Celestial.context.beginPath();
                            Celestial.context.moveTo(pt[0], pt[1] - r);
                            Celestial.context.lineTo(pt[0] + r, pt[1] + r);
                            Celestial.context.lineTo(pt[0] - r, pt[1] + r);
                            Celestial.context.closePath();
                            Celestial.context.fill();

                            if (mag < 8) {
                                Celestial.setTextStyle(styles.galaxy.namestyle);
                                Celestial.context.fillText('M'+m, pt[0]+r, pt[1]-r);
                            }
                        }
                        else if (nebula.indexOf(type) !== -1) {
                            styles.nebula.opacity = Math.pow((5.5/mag),2);
                            Celestial.setStyle(styles.nebula);
                            var s = 8;
                            var r = s / 1.5;
                            Celestial.context.beginPath();
                            Celestial.context.moveTo(pt[0], pt[1] - r);
                            Celestial.context.lineTo(pt[0] + r, pt[1]);
                            Celestial.context.lineTo(pt[0], pt[1] + r);
                            Celestial.context.lineTo(pt[0] - r, pt[1]);
                            Celestial.context.closePath();
                            Celestial.context.fill();
                            if (mag < 8) {
                                Celestial.setTextStyle(styles.nebula.namestyle);
                                Celestial.context.fillText('M'+m, pt[0]+r, pt[1]-r);
                            }
                        }
                        else if (type == 'Gc') {
                            styles.globular_cluster.opacity = Math.pow((5.5/mag),6);
                            var s = 8;
                            var r = s / 1.5;
                            Celestial.setStyle(styles.globular_cluster);
                            Celestial.map(d)
                            Celestial.context.beginPath();
                            Celestial.context.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                            Celestial.context.closePath();
                            Celestial.context.stroke();
                            if (mag < 6) {
                                Celestial.setTextStyle(styles.globular_cluster.namestyle);
                                Celestial.context.fillText('M'+m, pt[0]+r, pt[1]-r);
                            }
                        }
                        else if (type == 'Oc') {
                            styles.open_cluster.opacity = Math.pow((4.5/mag),2)/2 + 0.7;
                            Celestial.setStyle(styles.open_cluster);
                            var s = 8;
                            var r = s / 1.5;
                            Celestial.map(d)
                            Celestial.context.beginPath();
                            Celestial.context.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                            Celestial.context.closePath();
                            Celestial.context.stroke();
                            if (mag < 5) {
                                Celestial.setTextStyle(styles.open_cluster.namestyle);
                                Celestial.context.fillText('M'+m, pt[0]+r, pt[1]-r);
                            }
                        }
                        else {
                            Celestial.setStyle(styles.point);
                            Celestial.map(d)
                            Celestial.context.beginPath();
                            Celestial.context.arc(pt[0], pt[1], 5, 0, 2 * Math.PI);
                            Celestial.context.closePath();
                            Celestial.context.stroke();
                        }
                    }
                });
                // This retains the crosshairs when redrawing with different filters.
                // However, crosshairs are updated by themselves so an entire repaint is avoided.
                Celestial.setStyle(styles.crosshair);
                var p_coords = ([helpers.hour2degree(that.selectedRa), that.selectedDec]);
                var t_coords = ([helpers.hour2degree(that.mountRa), that.mountDec]);
                // Limit selectable regions to coordinates on the map with Celestial.clip().
                if (Celestial.clip(p_coords)) {
                    //Celestial.Canvas.symbol()
                    //.type("marker")
                    //.size(420)
                    //.position(Celestial.mapProjection(p_coords))(Celestial.context);

                    p_coords = Celestial.mapProjection(p_coords);
                    var r = 18;
                    var r2 = 4;
                    Celestial.context.beginPath();
                    Celestial.context.moveTo(p_coords[0], p_coords[1] - r);
                    Celestial.context.lineTo(p_coords[0], p_coords[1] - r2);
                    Celestial.context.moveTo(p_coords[0], p_coords[1] + r);
                    Celestial.context.lineTo(p_coords[0], p_coords[1] + r2);
                    Celestial.context.moveTo(p_coords[0] - r, p_coords[1]);
                    Celestial.context.lineTo(p_coords[0] - r2, p_coords[1]);
                    Celestial.context.moveTo(p_coords[0] + r, p_coords[1]);
                    Celestial.context.lineTo(p_coords[0] + r2, p_coords[1]);
                    Celestial.context.closePath();
                    Celestial.context.stroke();
                }
                Celestial.Canvas.symbol()
                    .type("cross-circle")
                    .size(220)
                    .position(Celestial.mapProjection(t_coords))(Celestial.context);
                Celestial.context.stroke();
            }});
        },

        update_pointer() {
            this.initializePointer();
            Celestial.redraw();
        },

        redraw() {
            Celestial.redraw()
        },

        rotate() {
            Celestial.rotate({center:[helpers.hour2degree(helpers.siderealTime(this.site_longitude)), this.site_latitude, 0]})
            Celestial.redraw()
        },

        zoom() {
            let position = Celestial.getPoint([this.selectedRa, this.selectedDec], 'equatorial')

            // Center on the coordinates:
            position = [helpers.hour2degree(position[0]), position[1], 0]
            Celestial.zoomBy(1.3)
            Celestial.rotate({center: position })

            Celestial.redraw()
        },

        animateZoom() {

            Celestial.resize({width: 2000})
            Celestial.redraw()

        }


    },
    mounted() {
        this.$store.dispatch('instrument_state/updateStatus')
        this.$nextTick(function () {
            this.handleClick();
            this.initializePointer();
            this.update_chart();
            Celestial.display(mapConfigs.config);
        })
    },


   // watch: {
   //     site_latitude(newLat) {
   //         Celestial.rotate({center:[helpers.hour2degree(helpers.siderealTime(this.site_longitude)), this.site_latitude, 0]})
   //         Celestial.redraw()
   //     },
   //     site_longitude(newLon) {
   //         Celestial.rotate({center:[helpers.hour2degree(helpers.siderealTime(this.site_longitude)), this.site_latitude, 0]})
   //         Celestial.redraw()
   //     }
   // },

    computed: {
        ...mapGetters('skyChart', {
            selectedRa: 'selectedRa',
            selectedDec: 'selectedDec',
        }),
        ...mapGetters('instrument_state', {
            all_mount_state: 'mount',
            all_telescope_state: 'telescope',

            star_types: 'star_types',
            star_mags: 'star_mags',
            dso_types: 'dso_types',
            dso_mags: 'dso_mags',
        }),
        ...mapGetters('observatory_configuration', {
            active_site: 'site',
            active_mount: 'mount',
            active_telescope: 'telescope',
            site_latitude: 'site_latitude',
            site_longitude: 'site_longitude',
        }),

        mountRa () {
            try {
                let ra = this.all_telescope_state[this.active_telescope].right_ascension
                return parseFloat(ra)
            } catch {
                return -1
            }
        }, 
        mountDec () {
            try {
                let dec = this.all_telescope_state[this.active_telescope].declination
                return parseFloat(dec)
            } catch {
                return -1
            }
        }, 
    },

    //beforeDestroy() {
    //    Celestial.clear()
    //},
}
</script>

<style scoped>
#celestial-map {
    width: 100%;
}
</style>
