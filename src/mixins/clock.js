
export const clock = {

  data () {
    return {
      timestampNow: new Date().getTime(),
      updateRoutine: ''
    }
  },

  created () {
    this.updateRoutine = setInterval(() => {
      this.timestampNow = new Date().getTime()
    }, 1000)
  },

  beforeDestroy () {
    clearInterval(this.update_routine)
  }
}
