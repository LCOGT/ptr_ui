<!--template>
    <section>

        <b-field grouped group-multiline>
            <div class="control">
                <b-switch v-model="showDetailIcon">Show detail icon</b-switch>
            </div>
        </b-field>

        <b-table
            :data="data"
            ref="table"
            paginated
            per-page="5"
            :opened-detailed="defaultOpenedDetails"
            detailed
            detail-key="id"
            @details-open="(row, index) => $toast.open(`Expanded ${row.user.first_name}`)"
            :show-detail-icon="showDetailIcon"
        >

            <template slot-scope="props">
                <b-table-column field="id" label="ID" width="40" numeric>
                    {{ props.row.id }}
                </b-table-column>

                <b-table-column field="user.first_name" label="First Name" sortable>
                    <template v-if="showDetailIcon">
                        {{ props.row.user.first_name }}
                    </template>
                    <template v-else>
                        <a @click="toggle(props.row)">
                            {{ props.row.user.first_name }}
                        </a>
                    </template>
                </b-table-column>

                <b-table-column field="user.last_name" label="Last Name" sortable>
                    {{ props.row.user.last_name }}
                </b-table-column>

                <b-table-column field="date" label="Date" sortable centered>
                    <span class="tag is-success">
                        {{ new Date(props.row.date).toLocaleDateString() }}
                    </span>
                </b-table-column>

                <b-table-column label="Gender">
                    <b-icon pack="fa"
                        :icon="props.row.gender === 'Male' ? 'mars' : 'venus'">
                    </b-icon>
                    {{ props.row.gender }}
                </b-table-column>
            </template>

            <template slot="detail" slot-scope="props">
                <article class="media">
                    <figure class="media-left">
                        <p class="image is-64x64">
                            <img src="/static/img/placeholder-128x128.png">
                        </p>
                    </figure>
                    <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>{{ props.row.user.first_name }} {{ props.row.user.last_name }}</strong>
                                <small>@{{ props.row.user.first_name }}</small>
                                <small>31m</small>
                                <br>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Proin ornare magna eros, eu pellentesque tortor vestibulum ut.
                                Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.
                            </p>
                        </div>
                    </div>
                </article>
            </template>
        </b-table>

    </section>
</template>

<script>
    const data = require('@/data/sample.json')

    export default {
        data() {
            return {
                data,
                defaultOpenedDetails: [1],
                showDetailIcon: true
            }
        },
        methods: {
            toggle(row) {
                this.$refs.table.toggleDetails(row)
            }
        }
    }
</script-->
<template>
    <section>

        <b-tabs>
            <b-tab-item label="Table">
                <b-table
                    :data="data"
                    :selected.sync="selected"
                    :narrowed="narrowed"
                    :hoverable="hoverable"
                    :paginated="isPaginated"
                    :paginationSimple="isPaginationSimple"
                    per-page="5"
                    detailed
                    detail-key="id"
                    focusable>

                    <template slot-scope="props">
                        <b-table-column field="id" label="ID" width="40" numeric>
                            {{ props.row.id }}
                        </b-table-column>

                        <b-table-column field="user.first_name" label="First Name" sortable>
                            <template v-if="showDetailIcon">
                                {{ props.row.user.first_name }}
                            </template>
                            <template v-else>
                                <a @click="toggle(props.row)">
                                    {{ props.row.user.first_name }}
                                </a>
                            </template>
                        </b-table-column>

                        <b-table-column field="user.last_name" label="Last Name" sortable>
                            {{ props.row.user.last_name }}
                        </b-table-column>

                        <b-table-column field="date" label="Date" sortable centered>
                            <span class="tag is-success">
                                {{ new Date(props.row.date).toLocaleDateString() }}
                            </span>
                        </b-table-column>

                        <b-table-column label="Gender">
                            <b-icon pack="fa"
                                :icon="props.row.gender === 'Male' ? 'mars' : 'venus'">
                            </b-icon>
                            {{ props.row.gender }}
                        </b-table-column>
                    </template>

                    <template slot="detail" slot-scope="props">
                        <article class="media">
                            <figure class="media-left">
                                <p class="image is-64x64">
                                    <img src="/static/img/placeholder-128x128.png">
                                </p>
                            </figure>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <strong>{{ props.row.user.first_name }} {{ props.row.user.last_name }}</strong>
                                        <small>@{{ props.row.user.first_name }}</small>
                                        <small>31m</small>
                                        <br>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                        Proin ornare magna eros, eu pellentesque tortor vestibulum ut.
                                        Maecenas non massa sem. Etiam finibus odio quis feugiat facilisis.
                                    </p>
                                </div>
                            </div>
                        </article>
                    </template>

                    <!--template slot-scope="props">
                        <b-table-column field="id" label="ID" width="40" sortable numeric>
                            {{ props.row.id }}
                        </b-table-column>

                        <b-table-column field="user.first_name" label="First Name" sortable>
                            {{ props.row.user.first_name }}
                        </b-table-column>

                        <b-table-column field="user.last_name" label="Last Name" sortable>
                            {{ props.row.user.last_name }}
                        </b-table-column>
                    </template-->

                </b-table>


            </b-tab-item>

            <b-tab-item label="Selected">
                <pre>{{ selected }}</pre>
            </b-tab-item>
        </b-tabs>
    </section>
</template>

<script>
    export default {
        name: 'ObjectTable',
        data() {
            const data = [
                {"id":1,"user":{"first_name":"Jesse","last_name":"Simmons"},"date":"2016/10/15 13:43:27","gender":"Male"},
                {"id":2,"user":{"first_name":"John","last_name":"Jacobs"},"date":"2016/12/15 06:00:53","gender":"Male"},
                {"id":3,"user":{"first_name":"Tina","last_name":"Gilbert"},"date":"2016/04/26 06:26:28","gender":"Female"},
                {"id":4,"user":{"first_name":"Clarence","last_name":"Flores"},"date":"2016/04/10 10:28:46","gender":"Male"},
                {"id":5,"user":{"first_name":"Anne","last_name":"Lee"},"date":"2016/12/06 14:38:38","gender":"Female"},
                {"id":6,"user":{"first_name":"Sara","last_name":"Armstrong"},"date":"2016/09/23 18:50:04","gender":"Female"},
                {"id":7,"user":{"first_name":"Anthony","last_name":"Webb"},"date":"2016/08/30 23:49:38","gender":"Male"},
                {"id":8,"user":{"first_name":"Andrew","last_name":"Greene"},"date":"2016/11/20 14:57:47","gender":"Male"},
                {"id":9,"user":{"first_name":"Russell","last_name":"White"},"date":"2016/07/13 09:29:49","gender":"Male"},
                {"id":10,"user":{"first_name":"Lori","last_name":"Hunter"},"date":"2016/12/09 01:44:05","gender":"Female"},
                {"id":11,"user":{"first_name":"Ronald","last_name":"Wood"},"date":"2016/12/04 02:23:48","gender":"Male"},
            ]

            return {
                data,
                selected: data[1],
                isPaginated: true,
                isPaginationSimple: false,
                defaultSortDirection: 'asc',
                hoverable: true,
                narrowed: true,
                currentPage: 1,
                defaultOpenedDetails: [1],
                showDetailIcon: true,
                /*columns: [
                    {
                        field: 'id',
                        label: 'ID',
                        width: '40',
                        numeric: true
                    },
                    {
                        field: 'first_name',
                        label: 'First Name',
                    },
                    {
                        field: 'last_name',
                        label: 'Last Name',
                    },
                    {
                        field: 'gender',
                        label: 'Gender',
                    }
                ]*/
            }
        },
        methods: {
            toggle(row) {
                this.$refs.table.toggleDetails(row)
            }
        }
    }
</script>