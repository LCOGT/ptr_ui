<template>

        <b-table
            :data="recent_images"
            :narrowed="isNarrowed"
            :loading="isLoading"
            :focusable="isFocusable"
            :selected.sync="current_image"
            :paginated="true"
            :per-page="20"
            class="no-margin"
            >

            <b-table-column field="filename" label="Filename" v-slot="props">
                {{ get_filename(props.row) }}
            </b-table-column>

            <b-table-column field="right_ascension" label="Right Ascension" v-slot="props">
                {{ get_right_ascension(props.row) }} 
            </b-table-column>

            <b-table-column field="declination" label="Declination" v-slot="props">
                {{ get_declination(props.row) }} 
            </b-table-column>

            <b-table-column field="exposure_time" label="Exposure Time" v-slot="props">
                {{ get_exposure_time(props.row) }} 
            </b-table-column>

            <b-table-column field="observation" label="Observation Time" centered v-slot="props">
                {{ get_observation_time(props.row) }}
            </b-table-column>

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
        methods: {
            get_filename(image) {
                if (image.base_filename) {
                    return image.base_filename
                }
                return "placeholder"
            },
            get_right_ascension(image) {
                if (image.right_ascension) {
                    return image.right_ascension.toFixed(3)
                }
                return '---'
            },
            get_declination(image) {
                if (image.declination) {
                    return image.declination.toFixed(3)
                }
                return '---'
            },
            get_exposure_time(image) {
                if (image.exposure_time) {
                    return image.exposure_time.toFixed(3)
                }
                return '---'
            },
            get_observation_time(image) {
                if (image.capture_date) {
                    return new Date(image.capture_date).toUTCString()
                }
                return '---'
            },

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
