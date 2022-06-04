<template>
<div>
    <b-field style="margin: 0;">
        <p class="control">
            <b-button 
                :disabled="note == ''"
                class="is-warning is-small" 
                outlined 
                @click="note_visible = true; editor_visible = false">
                operator message
            </b-button>
        </p>
        <p class="control" v-show="userIsAdmin" >
            <b-button 
                class="is-warning is-small" 
                outlined 
                icon-left="plus"
                @click="editor_visible = true; note_visible = false">
                new
            </b-button>
        </p>
    </b-field>
    <div class="note-container" id="night-log-draggable-note">
    <b-message 
        :title="note_title" 
        type="is-warning"
        v-model="note_visible" 
        class="night-log-message"
        aria-close-label="Close message">
        <p>{{note?.note_data?.message}}</p>
    </b-message>
    </div>
    <div class="note-container" id="night-log-draggable-editor">
    <b-message 
        title="New Message" 
        type="is-warning"
        v-model="editor_visible" 
        class="night-log-message"
        aria-close-label="Close message">
        <b-field horizontal label="From" >{{userName}}</b-field>
        <b-field label="Message" horizontal>
            <b-input v-model="note_editor_message" type="textarea"></b-input>
        </b-field>
        <b-field horizontal>
            <b-button @click="new_note">submit new message</b-button>
        </b-field>
        <b-field>
            <p>Note: messages are visible for 48 hours or until another note is created.</p>
        </b-field>
    </b-message>
    </div>
</div>
</template>

<script>
import axios from 'axios'
import { mapState, mapGetters } from 'vuex'
import { user_mixin } from '@/mixins/user_mixin'
export default {
    props: {
        site: String,
    },
    mixins: [ user_mixin ],
    data() {
        return {
            note_visible: false,
            editor_visible: false,
            note_editor_message: '',
            note: '',
        }
    },
    mounted() {
        this.get_note()
        $('#night-log-draggable-note').draggable({ cancel: "article section.message-body"})
        $('#night-log-draggable-editor').draggable({ cancel: "article section.message-body"})
    },
    methods: {
        get_note() {
            const url = this.$store.state.dev.active_api + '/nightlog/' + this.site
            axios.get(url).then(response => {
                console.log(response)
                this.note = response.data
                if (this.note !== '') {
                    this.note_visible = true
                    this.editor_visible = false
                }
            })
        },
        new_note() {
            const url = this.$store.state.dev.active_api + '/nightlog/' + this.site
            let note_data = {
                site: this.$route.params.sitecode,
                username: this.userName,
                userid: this.userId,
                message: this.note_editor_message,
                selected_image: this.current_image
            }
            let body = { note_data: note_data }
            axios.post(url, body).then(response => {
                console.log(response)
                this.get_note()
            })
        }
    },
    computed: {
        note_title() {
            return this.site.toUpperCase() + ' - Message from ' + this.note?.note_data?.username
        },
        ...mapGetters('images', [
            'current_image'
        ])
    }
}
</script>

<style lang="scss" scoped>
.note-container {
    position: absolute;
    width: 100%;
    margin-top: 1.5em;

    // shadow
    -webkit-box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
    -moz-box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
    box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);

}
</style>

<style>
.night-log-message .message-body {
    background-color: #151718;
}
.message.is-warning {
    background-color: #fffaeb;
}
.message.is-warning .message-body {
    /*color: #946c00;*/
    border: 2px solid;
}
.message.is-warning .message-body ::-moz-selection { 
    /* Code for Firefox */
    color: black;
    background: paleturquoise; /* highlight color */
}

.message.is-warning .message-body ::selection {
    color: black;
    background: paleturquoise; /* highlight color */
}
</style>
