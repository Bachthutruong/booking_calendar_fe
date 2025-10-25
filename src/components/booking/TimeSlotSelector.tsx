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

  return (
    <div className="max-w-full mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <Clock className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Chọn khung giờ</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          Chọn khung giờ phù hợp cho ngày <span className="font-semibold text-blue-600">{selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
        </p>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Chọn ngày khác
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Time Slots */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="text-center text-xl text-gray-800">Khung giờ khả dụng</CardTitle>
              <CardDescription className="text-center text-gray-600">
                {timeSlots.length} khung giờ có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải khung giờ...</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có khung giờ</h3>
                  <p className="text-gray-500 mb-4">Không có khung giờ khả dụng cho ngày này</p>
                  <Button variant="outline" onClick={onBack} className="border-gray-300">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Chọn ngày khác
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {timeSlots.map((slot: TimeSlot) => {
                    const isSelected = selectedTimeSlot === slot.startTime
                    const isFullyBooked = slot.currentBookings >= slot.maxBookings
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-16 flex flex-col items-center justify-center p-4 transition-all duration-200 ${
                          isFullyBooked 
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200' 
                            : isSelected 
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                              : 'hover:bg-green-50 hover:border-green-300 border-gray-200'
                        }`}
                        disabled={isFullyBooked}
                        onClick={() => !isFullyBooked && handleTimeSlotSelect(`${slot.startTime}-${slot.endTime}`)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{formatTimeRange(slot.startTime, slot.endTime)}</span>
                          {isSelected && <CheckCircle className="h-4 w-4" />}
                        </div>
                        <div className="text-xs mt-1">
                          {isFullyBooked ? (
                            <span className="text-red-500">Đã đầy</span>
                          ) : (
                            <span className="text-gray-500">
                              {slot.currentBookings}/{slot.maxBookings} đã đặt
                            </span>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selection Summary & Actions */}
        <div className="space-y-6">
          {selectedTimeSlot ? (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-center text-green-800 flex items-center justify-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Khung giờ đã chọn
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedTimeSlot.includes('-') ? selectedTimeSlot.split('-').map(t => formatTime(t.trim())).join(' - ') : formatTime(selectedTimeSlot)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleNext} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  >
                    Tiếp tục
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={onBack}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Chọn ngày khác
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="text-center py-8">
                <Clock className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa chọn giờ</h3>
                <p className="text-gray-600">
                  Vui lòng chọn một khung giờ từ danh sách bên trái
                </p>
              </CardContent>
            </Card>
          )}

          {/* Help Text */}
          <Card className="border-0 bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">💡 Lưu ý:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Chọn khung giờ phù hợp với lịch trình</li>
                <li>• Có thể thay đổi lựa chọn bất kỳ lúc nào</li>
                <li>• Số lượng đặt lịch có giới hạn cho mỗi khung giờ</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TimeSlotSelector
