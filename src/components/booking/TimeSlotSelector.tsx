import { useState } from 'react'
import { useQuery } from 'react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bookingAPI } from '@/lib/api'
import { formatTime, formatTimeRange } from '@/lib/utils'
import { Clock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  maxBookings: number
  currentBookings: number
}

interface TimeSlotSelectorProps {
  selectedDate: string
  onTimeSlotSelect: (timeSlot: string) => void
  onBack: () => void
  onNext: () => void
}

const TimeSlotSelector = ({ selectedDate, onTimeSlotSelect, onBack, onNext }: TimeSlotSelectorProps) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')

  const { data: timeSlotsData, isLoading } = useQuery(
    ['timeSlots', selectedDate],
    () => bookingAPI.getAvailableTimeSlots(selectedDate),
    {
      enabled: !!selectedDate,
    }
  )

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    onTimeSlotSelect(timeSlot)
  }

  const handleNext = () => {
    if (selectedTimeSlot) {
      onNext()
    }
  }

  const timeSlots = timeSlotsData?.data.timeSlots || []
  const availableSlots = timeSlots.filter((s: TimeSlot) => s.currentBookings < s.maxBookings)

  return (
    <div className="max-w-full mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <Clock className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">選擇時段</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          為 <span className="font-semibold text-blue-600">{selectedDate ? new Date(selectedDate).toLocaleDateString('zh-TW') : 'N/A'}</span> 選擇合適的時段
        </p>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          選擇其他日期
        </Button>
      </div>

      <div>
        {/* Time Slots - full width */}
        <div>
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-center text-xl text-gray-800">可用時段</CardTitle>
              <CardDescription className="text-center text-gray-600">
                {availableSlots.length} 個可用時段
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">正在載入時段...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">沒有可用時段</h3>
                  <p className="text-gray-500 mb-4">此日期沒有可用時段</p>
                  <Button variant="outline" onClick={onBack} className="border-gray-300">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    選擇其他日期
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-3">
                    {availableSlots.map((slot: TimeSlot) => {
                      const isSelected = selectedTimeSlot === `${slot.startTime}-${slot.endTime}`
                      const baseClasses = 'px-4 py-2 rounded-full text-sm border transition-all duration-200'
                      const selectableClasses = isSelected
                        ? 'bg-green-600 text-white border-green-700 shadow'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-green-400 hover:bg-green-50'

                      return (
                        <button
                          key={slot.id}
                          className={`${baseClasses} ${selectableClasses}`}
                          onClick={() => handleTimeSlotSelect(`${slot.startTime}-${slot.endTime}`)}
                          aria-pressed={isSelected}
                        >
                          <span className="font-semibold mr-2">{formatTimeRange(slot.startTime, slot.endTime)}</span>
                          {isSelected && <CheckCircle className="inline h-4 w-4 ml-1" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <Button 
                      onClick={handleNext} 
                      disabled={!selectedTimeSlot}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      繼續
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={onBack}
                      className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      選擇其他日期
                    </Button>
                    {selectedTimeSlot && (
                      <span className="text-sm text-gray-600">
                        已選擇：<span className="font-semibold text-gray-800">{selectedTimeSlot.includes('-') ? selectedTimeSlot.split('-').map(t => formatTime(t.trim())).join(' - ') : formatTime(selectedTimeSlot)}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TimeSlotSelector
