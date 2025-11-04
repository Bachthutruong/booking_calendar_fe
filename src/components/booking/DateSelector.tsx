import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isPast, isToday } from '@/lib/utils'
import { bookingAPI } from '@/lib/api'
import { Calendar as CalendarIcon } from 'lucide-react'

interface DateSelectorProps {
  onDateSelect: (date: string) => void
}

const DateSelector = ({ onDateSelect }: DateSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [unavailableDays, setUnavailableDays] = useState<Set<string>>(new Set())
  const [, setLoadingMonth] = useState<boolean>(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isPast(date)) {
      setSelectedDate(date)
      // Format date as YYYY-MM-DD without timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onDateSelect(`${year}-${month}-${day}`)
    }
  }

  // Next step is triggered elsewhere after date selection; no local buttons here

  const handleMonthChange = (month: string) => {
    setCurrentMonth(parseInt(month))
  }

  const handleYearChange = (year: string) => {
    setCurrentYear(parseInt(year))
  }

  const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i)

  // Format date as YYYY-MM-DD without timezone issues
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Fetch availability for the visible month; days with 0 slots will be disabled
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      try {
        setLoadingMonth(true)
        const end = new Date(currentYear, currentMonth + 1, 0)
        const requests = Array.from({ length: end.getDate() }, (_, i) => {
          const d = new Date(currentYear, currentMonth, i + 1)
          const dateStr = formatDateString(d)
          return bookingAPI.getAvailableTimeSlots(dateStr).then(r => ({ dateStr, slots: r.data?.timeSlots || [] })).catch(() => ({ dateStr, slots: [] }))
        })
        const results = await Promise.all(requests)
        const disabledSet = new Set<string>()
        results.forEach(({ dateStr, slots }) => {
          if (!slots || slots.length === 0) disabledSet.add(dateStr)
        })
        setUnavailableDays(disabledSet)
      } finally {
        setLoadingMonth(false)
      }
    }
    fetchMonthAvailability()
  }, [currentMonth, currentYear])

  return (
    <div className="max-w-full mx-auto">
      {/* <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <CalendarIcon className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">選擇預約日期</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          請選擇您想預約諮詢的日期。您隨時可以變更選擇。
        </p>
      </div> */}

      <div className="flex flex-col gap-6">
        {/* Calendar Section */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <CalendarIcon className="h-8 w-8 text-white" />
                <CardTitle className="text-3xl font-bold">預約行事曆</CardTitle>
              </div>
              <CardDescription className="text-blue-100 text-lg">
                點擊日期以選擇諮詢時間
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Calendar Header Info */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-gray-800 text-lg">選擇月份／年份</p>
                    <div className="flex items-center space-x-2">
                      <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-32 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-20 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
 
              </div>
            </div>

            {/* Enhanced Calendar */}
            <div className="p-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm w-full">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  showOutsideDays={false}
                  disabled={(date) => {
                    // Disable past dates, today (lead time >= 1 day),
                    // and any date with no available slots per admin config
                    if (isPast(date) || isToday(date)) return true
                    const dateStr = formatDateString(date)
                    return unavailableDays.has(dateStr)
                  }}
                  className="w-full"
                  month={new Date(currentYear, currentMonth)}
                  onMonthChange={(date) => {
                    setCurrentMonth(date.getMonth())
                    setCurrentYear(date.getFullYear())
                  }}
                  formatters={{
                    // Caption like: 2025年 11月
                    formatCaption: (date) => `${date.getFullYear()}年 ${date.getMonth() + 1}月`,
                    // Weekday headers mapping: Sun 日, Mon 一, ...
                    formatWeekdayName: (date) => {
                      const names = ['日', '一', '二', '三', '四', '五', '六']
                      return names[date.getDay()]
                    },
                  }}
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-6 pb-4 relative items-center bg-gray-50 border-b border-gray-200",
                    caption_label: "text-2xl font-bold text-gray-800",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-12 w-12 bg-white border border-gray-300 rounded-lg p-0 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center shadow-sm",
                    nav_button_previous: "absolute left-6",
                    nav_button_next: "absolute right-6",
                    table: "w-full border-collapse",
                    head_row: "flex border-b border-gray-200",
                    head_cell: "text-gray-600 rounded-none flex-1 h-16 font-bold text-base flex items-center justify-center bg-gray-50",
                    row: "flex w-full border-b border-gray-100 last:border-b-0",
                    cell: "flex-1 h-20 text-center text-base p-0 relative border-r border-gray-100 last:border-r-0 hover:bg-blue-50 transition-colors duration-200",
                    day: "h-20 w-full p-0 font-semibold text-lg aria-selected:opacity-100 hover:bg-blue-100 hover:text-blue-900 rounded-none transition-all duration-200 flex items-center justify-center",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white font-bold shadow-lg",
                    day_today: "bg-orange-100 text-orange-600 font-bold border-2 border-orange-300",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-300 cursor-not-allowed bg-gray-50",
                    day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => (
                      <div className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                        <svg {...props} className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    ),
                    IconRight: ({ ...props }) => (
                      <div className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                        <svg {...props} className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ),
                    DayContent: ({ date }) => {
                      const today = new Date()
                      const isToday =
                        date.getFullYear() === today.getFullYear() &&
                        date.getMonth() === today.getMonth() &&
                        date.getDate() === today.getDate()
                      return (
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span>{date.getDate()}</span>
                          {isToday && (
                            <span className="text-[10px] mt-0.5 text-orange-600">今天</span>
                          )}
                        </div>
                      )
                    },
                  }}
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Removed selection summary and tips section per request */}
      </div>
    </div>
  )
}

export default DateSelector
