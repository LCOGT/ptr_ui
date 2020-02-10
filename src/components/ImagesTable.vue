<template>
    <section>

        <b-table
            :data="recent_images"
            :narrowed="isNarrowed"
            :loading="isLoading"
            :focusable="isFocusable"
            :selected.sync="current_image"
            paginated="true"
            per-page="20"
            >

            <template slot-scope="props">
                <b-table-column field="filename" label="Filename">
                    {{ props.row.base_filename }}
                </b-table-column>

                <b-table-column field="right_ascension" label="Right Ascension">
                    {{ props.row.right_ascension.toFixed(3) }} 
                </b-table-column>

                <b-table-column field="declination" label="Declination">
                    {{ props.row.declination.toFixed(3) }} 
                </b-table-column>

                <b-table-column field="exposure_time" label="Exposure Time">
                    {{ props.row.exposure_time}} 
                </b-table-column>


                <b-table-column field="fits_download" label="Fits Download">
                    <a :href="props.row.fits13_url">download</a>
                </b-table-column>

                <b-table-column field="observation" label="Observation Time" centered>
                        {{ new Date(props.row.capture_date).toUTCString() }}
                </b-table-column>
            </template>

            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p>
                            <b-icon
                                icon="emoticon-sad"
                                size="is-large">
                            </b-icon>
                        </p>
                        <p>Nothing here.</p>
                    </div>
                </section>
            </template>
        </b-table>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
    export default {
        data() {
            return {
                isEmpty: false,
                isNarrowed: true,
                isFocusable:true,
                isLoading: false,
                isSelectable: true,
            }
        },

        computed: {
            ...mapGetters('images', [
                'recent_images',
            ]),

            current_image: {
                get() {return this.$store.getters['images/current_image']},
                set(value) {this.$store.dispatch('images/set_current_image', value)}
            },
        },
    }
</script>