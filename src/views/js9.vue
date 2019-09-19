<template>
    <div>
        <button class="button is-primary is-medium"
            @click="cardModal()">
            Launch image modal (HTML)
        </button>
    </div>
</template>

<script>
import { API, Auth } from "aws-amplify";
import JS9 from "@/components/JS9";

export default {
  name: "js9",
  components: { JS9 },
  methods: {
    cardModal() {
        this.$buefy.modal.open({
            parent: this,
            component: JS9,
            hasModalCard: true,
            customClass: 'custom-class custom-class-2'
        })
    }
  }
};
</script>

<style scoped>
</style>