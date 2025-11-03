import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, isPast } from '@/lib/utils'
import { Calendar as CalendarIcon, ArrowRight, RotateCcw } from 'lucide-react'

interface DateSelectorProps {
  onDateSelect: (date: string) => void
  onNext: () => void
}

const DateSelector = ({ onDateSelect, onNext }: DateSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

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

  const handleNext = () => {
    if (selectedDate) {
      onNext()
    }
  }

  const handleClearSelection = () => {
    setSelectedDate(undefined)
  }

  const handleMonthChange = (month: string) => {
    setCurrentMonth(parseInt(month))
  }

  const handleYearChange = (year: string) => {
    setCurrentYear(parseInt(year))
  }

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i)

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
                  disabled={(date) => isPast(date)}
                  className="w-full"
                  month={new Date(currentYear, currentMonth)}
                  onMonthChange={(date) => {
                    setCurrentMonth(date.getMonth())
                    setCurrentYear(date.getFullYear())
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
                  }}
                />
              </div>
            </div>

            {/* Calendar Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">已選擇</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                    <span className="text-gray-600">今天</span>
                  </div>
                </div>
                <div className="text-gray-500">
                  💡 從明天開始可選擇日期
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selection Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          {selectedDate ? (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-center text-green-800 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  已選擇日期
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedDate.toLocaleDateString('zh-TW', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedDate)}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleClearSelection}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新選擇
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    Tiếp tục
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="text-center py-8">
                <CalendarIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">尚未選擇日期</h3>
                <p className="text-gray-600">
                  請從左側行事曆選擇日期以繼續
                </p>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Help Text */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <span className="text-2xl">💡</span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">預約指南</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="bg-green-100 rounded-full p-1 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">選擇合適日期</p>
                    <p className="text-sm text-gray-600">只能預約從明天起的日期</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <span className="text-blue-600 text-sm">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">靈活變更</p>
                    <p className="text-sm text-gray-600">可隨時變更日期</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                    <span className="text-purple-600 text-sm">⏰</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">下一步</p>
                    <p className="text-sm text-gray-600">選擇日期後，您將選擇合適的時段</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                <p className="text-sm text-center text-gray-700">
                  <span className="font-semibold">🎯 小撇步：</span> 週末通常會有較多可用時段！
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DateSelector
