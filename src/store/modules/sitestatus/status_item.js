export default class StatusItem {



    // default values
    timestamp = 0
    description = "No description provided"

    secondsBeforeStale = 300 // status is stale if not updated in the last 5 minutes

    constructor(name, value, units, timestamp, weather_status_age) {
        this.name = name
        this.value = value
        this.units = units ?? ''
        this.timestamp = timestamp ?? 0
        this.weather_status_age = weather_status_age
    }



    get displayVal() {
        return `${this.value} ${this.units}`
    }

    get description() {
        return `Description for ${this.name}: ${this.description}`
    }
    set description(val) {
        this.description = val
    }

    get isStale() {
        return true
        return (this.weather_status_age > 3)
    }

    styleClass() {
        return ''
    }

    makeObject() {
        return {
            name: this.name,
            val: this.value,
            units: this.units,
            displayVal: this.displayVal,
            timestamp: this.timestamp,
            color: 'blue',
            is_stale: this.isStale 

        }
    }

}


