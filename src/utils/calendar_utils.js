import moment from 'moment'
import SunCalc from 'suncalc'

// Make sure we don't display sensitive data (e.g. email addresses) in the public calendar
const removeSensitiveData = (string, showEmail) =>
{
  // conditionally show email if the user is an admin or the owner of a block
  if (showEmail) {
    return string
  }
  else {
    return string.split('@')[0]
  }
}

// Make a unique id for calendar events. UUID style. This is the pk in dynamodb.
const makeUniqueID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
    c
  ) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Return a deep copy of a fullcalendar event
// This is a circular js object, and some simpler deep copy techniques dont' work
const copyFcEvent = (event) => {
  const copiedEvent = {
    allDay: event.allDay,
    allow: event.allow,
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor,
    classNames: event.classNames,
    constraint: event.constraint,
    durationEditable: event.durationEditable,
    end: event.end,
    extendedProps: event.extendedProps,
    groupId: event.groupId,
    id: event.id,
    overlap: event.overlap,
    rendering: event.rendering,
    source: event.source,
    start: event.start,
    startEditable: event.startEditable,
    textColor: event.textColor,
    title: event.title,
    url: event.url
  }
  return copiedEvent
}

// Take events from fullCalendar event handlers (e.g. drag/drop) and convert to the format used in our backend
const convertFullCalendarEventToPtrFormat = event => {
  console.log(event)
  return {
    event_id: event.id,
    start: moment(event.start).utc().format(),
    end: moment(event.end).utc().format(),
    creator: event.extendedProps.creator,
    creator_id: event.extendedProps.creator_id,
    site: event.extendedProps.site,
    title: event.title,
    reservation_type: event.extendedProps.reservation_type,
    reservation_note: event.extendedProps.reservation_note,
    resourceId: event.extendedProps.site,
    project_id: event.extendedProps.project_id,
    project_priority: event.extendedProps.project_priority,
    rendering: event.rendering
  }
}

const convertEventEditorResponseToPtrFormat = (event) => {
  return {
    event_id: event.id,
    start: moment(event.startStr).utc().format(),
    end: moment(event.endStr).utc().format(),
    creator: event.creator,
    creator_id: event.creator_id,
    site: event.site,
    title: event.title,
    reservation_type: event.reservation_type,
    resourceId: event.resourceId,
    project_id: event.project_id,
    project_priority: event.project_priority,
    reservation_note: event.reservation_note,
    rendering: event.rendering
  }
}

const getMoonPhaseDays = (year, month, day) => {
  // https://gist.github.com/endel/dfe6bb2fbe679781948c
  const Moon = {
    phases: ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous',
      'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'],
    phase: function (year, month, day) {
      let e
      let jd
      let b
      let c = e = jd = b = 0

      if (month < 3) {
        year--
        month += 12
      }

      ++month
      c = 365.25 * year
      e = 30.6 * month
      jd = c + e + day - 694039.09 // jd is total days elapsed
      jd /= 29.5305882 // divide by the moon cycle
      b = parseInt(jd) // int(jd) -> b, take integer part of jd
      jd -= b // subtract integer part to leave fractional part of original jd
      b = Math.round(jd * 8) // scale fraction from 0-8 and round

      if (b >= 8) b = 0 // 0 and 8 are the same so turn 8 into 0
      return { phase: b, name: Moon.phases[b] }
    }
  }

  try { // ignore errors caused by the timezone not being loaded yet.
    const moment_today = moment([year, month, day]).utc()
    const moment_yesterday = moment([year, month, day]).utc().add(-1, 'days')

    const phase_today = Moon.phase(
      moment_today.year(),
      moment_today.month(),
      moment_today.date())
    const phase_yesterday = Moon.phase(
      moment_yesterday.year(),
      moment_yesterday.month(),
      moment_yesterday.date())

    // If the phase is changed from the previous day, then return it to
    // display on the calendar.
    if (phase_today.phase != phase_yesterday.phase) {
      return phase_today
    } else {
      return false
    }
  } catch {
    return false
  }
}

/**
 * Helper function for displaying moon visibility in the calendar.
 * Returns a grey color with brightness corresponding to moon brightness.
 * @param {float} illum: moon illumination between 0 and 1.
 * @returns {string}: css value, something like 'rgba(255,255,255,0.5)'
 */
const rgba_from_illumination = (illum, peak) => {
  const alpha = 0.1 + (0.9 * illum) // should have minimum opacity of 0.1
  return `rgba(${peak},${peak},${peak},${alpha})`
}

// Generate the twilight events (in proper fullCalendar format)
// for one day column (evening-of and morning-after the given date.)
const oneDayTwilight = (timestamp, latitude, longitude) => {
  const events = {}

  const msPerDay = 1000 * 60 * 60 * 24
  const sunEvents = SunCalc.getTimes(
    new Date(timestamp),
    latitude,
    longitude
  )
  const nextDayEvents = SunCalc.getTimes(
    new Date(timestamp + msPerDay),
    latitude,
    longitude
  )
  // We don't currently use prevDayEvents but it's here for reference.
  /*
  const prevDayEvents = SunCalc.getTimes(
    new Date(timestamp - msPerDay),
    latitude,
    longitude
  )
  */

  const currentDateObj = new Date(timestamp)

  // The event colors for the calendar
  const daylightColor = '#81D4FA'
  const civilColor = '#1B9FD8'
  const nauticalColor = '#166EA9'
  const astronomicalColor = '#084165'

  events.civilTwilightDusk = {
    title: 'Civil Twilight',
    start: sunEvents.sunset,
    end: sunEvents.dusk,
    backgroundColor: civilColor,
    rendering: 'background',
    id: `${currentDateObj.toISOString()}_civil_dusk`
  }
  events.nauticalTwilightDusk = {
    title: 'Nautical Twilight',
    start: sunEvents.dusk,
    end: sunEvents.nauticalDusk,
    backgroundColor: nauticalColor,
    rendering: 'background',
    id: `${currentDateObj.toISOString()}_nautical_dusk`
  }
  events.astronomicalTwilightDusk = {
    title: 'Astronomical Twilight',
    start: sunEvents.nauticalDusk,
    end: sunEvents.night,
    backgroundColor: astronomicalColor,
    rendering: 'background',
    id: `${currentDateObj.toISOString()}_astronomical_dusk`
  }

  events.astronomicalTwilightDawn = {
    title: 'Astronomical Twilight',
    start: nextDayEvents.nightEnd,
    end: nextDayEvents.nauticalDawn,
    backgroundColor: astronomicalColor,
    rendering: 'background',
    id: `${currentDateObj.toISOString()}_astronomical_dawn`
  }
  events.nauticalTwilightDawn = {
    title: 'Nautical Twilight',
    start: nextDayEvents.nauticalDawn,
    end: nextDayEvents.dawn,
    backgroundColor: nauticalColor,
    rendering: 'background',
    id: `${currentDateObj.toISOString()}_nautical_dawn`
  }
  events.civilTwilightDawn = {
    title: 'Civil Twilight',
    start: nextDayEvents.dawn,
    end: nextDayEvents.sunrise,
    backgroundColor: civilColor,
    rendering: 'background',
    id: `${currentDateObj.toISOString()}_civil_dawn`
  }
  events.daylightMorning = {
    title: 'Morning Daylight',
    start: nextDayEvents.sunrise,
    end: nextDayEvents.sunset,
    // end: new Date(new Date(timestamp).setHours(36)),
    rendering: 'background',
    backgroundColor: daylightColor,
    id: `${currentDateObj.toISOString()}_day_morning`
  }
  return events
}

export {
  removeSensitiveData,
  makeUniqueID,
  copyFcEvent,
  convertFullCalendarEventToPtrFormat,
  convertEventEditorResponseToPtrFormat,
  getMoonPhaseDays,
  rgba_from_illumination,
  oneDayTwilight
}
