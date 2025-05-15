<template>
  <div
    v-if="showWarning && isActive"
    class="google-warning-container"
  >
    <b-message
      :active.sync="isActive"
      title="Please create a new Photon Ranch account"
      type="is-warning"
      has-icon
      aria-close-label="Close message"
      @close="handleClose"
    >
      <p>
        We are in the process of removing google as a login option to reduce how much personal information is publicized.
        Please create a new account for Photon Ranch with a custom username and password to replace this one.
      </p>
      <p>
        Note: it's still ok to list a gmail address in the email field.
      </p>
      <p>
        Photon Ranch accounts that use the "login with Google" option will be disabled after <strong>June 1, 2025</strong>.
      </p>
      <b-button
        type="is-warning"
        outlined
        @click="dismissWarning"
      >
        Dismiss
      </b-button>
    </b-message>
  </div>
</template>

<script>
export default {
  name: 'GoogleAccountWarning',
  props: {
    showWarning: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isActive: false
    }
  },
  watch: {
    showWarning: {
      immediate: true,
      handler (newValue) {
        this.isActive = newValue
      }
    },
    isActive (newValue) {
      if (!newValue && this.showWarning) {
        // If b-message closes itself (e.g. via ESC key), ensure we emit dismiss
        this.$emit('dismiss')
      }
    }
  },
  methods: {
    dismissWarning () {
      this.isActive = false
      this.$emit('dismiss')
    },
    handleClose () { // Added space
      // This method is called when b-message's internal close (X button or ESC) happens
      this.isActive = false // Removed semicolon
      this.$emit('dismiss') // Removed semicolon
    }
  }
}
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 1em;
}
.google-warning-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  z-index: 1050;

  -webkit-box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
  -moz-box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
  box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
}

.google-warning-container ::v-deep .message.is-warning {
  background-color: #181818;
}

.google-warning-container ::v-deep .message.is-warning .message-header button.delete:hover {
  background-color: rgba(255, 255, 255, 0.1); // Slight highlight on hover
}

.google-warning-container ::v-deep .message.is-warning .message-body {
  color: #f0f0f0;
}

.google-warning-container ::v-deep .b-button.is-warning.is-outlined {
  color: #ffdd57;
  border-color: #ffdd57;
  margin-top: 0.5rem; // Add some space above the button
}
.google-warning-container ::v-deep .b-button.is-warning.is-outlined:hover {
  background-color: rgba(255, 221, 87, 0.1);
  color: #ffdd57;
}

</style>
