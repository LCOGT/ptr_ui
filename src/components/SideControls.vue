<template>
<div id="side-controls">
    <sidebar width="900px;"></sidebar>

    <section class="expandable">
        <a class="button">
            <span class="icon is-large">
            <i class="fas fa-arrow-right"></i>
            </span>
        </a>
    </section>
    <section class="component">
        <b-collapse class="card">
            <div slot="trigger" slot-scope="props" class="card-header" @click="isOpen = !isOpen">
                <p class="card-header-title">
                    Component
                </p>
                <a class="card-header-icon">
                    <b-icon pack="fas"
                        :icon="isOpen ? 'caret-down' : 'caret-up'">
                    </b-icon>
                </a>
            </div>
            <p class="panel-tabs">
                <a class="is-active">all</a>
                <a>public</a>
                <a>private</a>
                <a>sources</a>
                <a>forks</a>
            </p>
            <div class="card-content">
                <a class="panel-block is-active">
                    <span class="panel-icon">
                    <i class="fas fa-book" aria-hidden="true"></i>
                    </span>
                    bulma
                </a>
                <label class="panel-block">
                    <input type="checkbox">
                    remember me
                </label>
            </div>
            <footer class="card-footer">
                <a class="card-footer-item">Save</a>
                <a class="card-footer-item">Edit</a>
                <a class="card-footer-item">Delete</a>
            </footer>
        </b-collapse>
    </section>


    </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
export default {
    name: 'SideControls',
    data() {
        return {
            isOpen: true
        }
    },
    components: {
        Sidebar
    }
}
</script>

<style scoped>
#side-controls {
}
</style>
