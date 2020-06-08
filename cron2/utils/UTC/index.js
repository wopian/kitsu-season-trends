export class UTC {
  constructor (date = new Date()) {
    this.date = date
    this.utc = this.date

    // If the date specifies a timezone offset, or is already UTC, keep the date part, reflecting the date in that timezone
    if (typeof this.date === 'string' && this.date.match(/((\+|-)\d{2}:\d{2}|Z)$/gm)) {
      this.utc = new Date(this.date.substring(0, 10) + 'T00:00:00Z')
    } else if (!(this.date instanceof Date)) {
      // If date is not a date object, make it a date
      this.date = new Date(this.date)
      // Strip time from date object
      this.utc = new Date(Date.UTC(this.date.getFullYear(), this.date.getMonth(), this.date.getDate()))
    } // else this.utc = this.date

    return this.utc
  }

  toISOString () {
    return this.utc.toISOString()
  }

  toString () {
    return this.utc.toString()
  }

  getUTCDate () {
    return this.utc.getUTCDate()
  }

  getUTCDay () {
    return this.utc.getUTCDay()
  }

  getUTCFullYear () {
    return this.utc.getUTCFullYear()
  }

  getUTCMonth () {
    return this.utc.getUTCMonth()
  }

  setUTCDate (arg) {
    return this.utc.setUTCDate(arg)
  }

  setUTCFullYear (arg) {
    return this.utc.setUTCFullYear(arg)
  }

  setUTCMonth (arg) {
    return this.utc.setUTCMonth(arg)
  }

  addDays (days) {
    this.utc.setUTCDate(this.getUTCDate() + days)
  }

  toLocaleDateString (locale = 'en-GB', options = {}) {
    options.timezone = 'UTC'
    return this.utc.toLocaleDateString(locale, options)
  }
}

/*
export function UTC (date = new Date()) {
  new Date(date).toISOString()
  // new Date(date + 'T00:00:00.000Z').toISOString()
}
*/
