
export const clock = {

    data() {
        return {
            timestamp_now: new Date().getTime(),
            update_routine: '',
        }
    },

    created() {
        this.update_routine = setInterval(() => {
            this.timestamp_now = new Date().getTime()
        }, 1000)
    },

    beforeDestroy() {
        clearInterval(this.update_routine)
    },
}