
const STALE_AGE_MS = 1000 * 60 * 5 // 5 minutes before status is reported to be stale

const display_colors = {
  default: 'lightgrey',
  red: 'orangered',
  yellow: 'yellow',
  green: 'greenyellow',
  missing: 'grey'
}

function isItemStale (getters, device_state, status_key) {
  const now = getters.now // use a getter so this stays reactive
  const status_timestamp = getters[device_state][status_key]?.timestamp
  if (typeof status_timestamp == 'undefined') { return true }
  return now - status_timestamp > STALE_AGE_MS
}

function statusAgeDisplay (status_age) {
  if (status_age < 60) {
    return {
      val: status_age_seconds(status_age),
      color: display_colors.green
    }
  } else if (status_age < 300) {
    return {
      val: status_age_minutes(status_age),
      color: display_colors.green
    }
  } else if (status_age < 600) {
    return {
      val: status_age_minutes(status_age),
      color: display_colors.yellow
    }
  } else if (status_age < 3600) {
    return {
      val: status_age_minutes(status_age),
      color: display_colors.red
    }
  } else if (status_age < 86400) {
    return {
      val: status_age_hours(status_age),
      color: display_colors.red
    }
  } else if (status_age < 18000 * 86400) {
    return {
      val: status_age_days(status_age),
      color: display_colors.red
    }
  } else {
    return {
      val: 'na',
      color: display_colors.red
    }
  }
}
function status_age_days (timestamp_ms) {
  let timestring = ''
  const days = parseInt(timestamp_ms / 86400)
  const hours = parseInt((timestamp_ms % 86400) / 3600)
  timestring += days + 'd  '
  timestring += hours + 'h  '
  return timestring
}
function status_age_hours (timestamp_ms) {
  let timestring = ''
  const hours = parseInt(timestamp_ms / 3600)
  const minutes = parseInt((timestamp_ms % 3600) / 60)
  timestring += hours + 'h  '
  timestring += minutes + 'm  '
  return timestring
}
function status_age_minutes (timestamp_ms) {
  let timestring = ''
  let minutes = parseInt(timestamp_ms / 60)
  let seconds = parseInt(timestamp_ms % 60)
  timestring += minutes += 'm  '
  timestring += seconds += 's  '
  return timestring
}
function status_age_seconds (timestamp_ms) {
  return parseInt(timestamp_ms) + 's '
}

const parseTrueFalse = s => {
  if (typeof s == 'object') {
    return parseTrueFalse(s.val)
  }
  if (undefined == s) {
    return false
  }
  if (typeof s === 'boolean') {
    return s
  }
  else if (s.toLowerCase() == 'true') { return true }
  else if (s.toLowerCase() == 'false') { return false }
  return false
}

export {
  STALE_AGE_MS,
  display_colors,
  isItemStale,
  statusAgeDisplay,
  parseTrueFalse
}
