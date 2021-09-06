/**
 * support function via dayjs
 * --------------------------
 */

import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import config from '@/static/config'

const format = 'YYYY-MM-DD'

export function sub(ts) {
  return dayjs(ts).subtract(1, 's').valueOf()
}

/**
 * @params ts
 *  find first & last day in the week of d, format them and return
 * @return 
 *  { BeginDTime, EndDTime }
 */
export function getDateTimeForApi(d) {
  dayjs.extend(weekday)

  const beginWeekday = config.caseListBeginWeekday

  let BeginDTime = dayjs(d).weekday(beginWeekday).format(`${format}T00:00:00`)
    , EndDTime = dayjs(d).weekday(beginWeekday + 6).format(`${format}T23:59:59`)

  return { BeginDTime, EndDTime }
}