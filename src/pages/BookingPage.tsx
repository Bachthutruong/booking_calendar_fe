import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import DateSelectorWithTimeSlots from '@/components/booking/DateSelectorWithTimeSlots'
import TimeSlotSelector from '@/components/booking/TimeSlotSelector'
import BookingForm from '@/components/booking/BookingForm'
import Footer from '@/components/common/Footer'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

const BookingPage = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [step, setStep] = useState<'date' | 'time' | 'form'>('date')

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setStep('time')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    setStep('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (step === 'time') {
      setStep('date')
    } else if (step === 'form') {
      setStep('time')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStepInfo = () => {
    switch (step) {
      case 'date':
        return { title: 'Chọn ngày', icon: Calendar, description: 'Chọn ngày bạn muốn đặt lịch' }
      case 'time':
        return { title: 'Chọn giờ', icon: Clock, description: 'Chọn khung giờ phù hợp' }
      case 'form':
        return { title: 'Thông tin', icon: User, description: 'Điền thông tin liên hệ' }
      default:
        return { title: '', icon: Calendar, description: '' }
    }
  }

  const stepInfo = getStepInfo()
  const StepIcon = stepInfo.icon

  const renderStep = () => {
    switch (step) {
      case 'date':
        return (
          <DateSelectorWithTimeSlots
            onDateSelect={handleDateSelect}
            onNext={() => setStep('time')}
          />
        )
      case 'time':
        return (
          <TimeSlotSelector
            selectedDate={selectedDate}
            onTimeSlotSelect={handleTimeSlotSelect}
            onBack={() => setStep('date')}
            onNext={() => setStep('form')}
          />
        )
      case 'form':
        return (
          <BookingForm
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onBack={handleBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 px-3 py-1.5"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Trang chủ
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 rounded-lg p-1.5">
                  <StepIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">{stepInfo.title}</h1>
                  <p className="text-xs text-gray-600">{stepInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step === 'date' ? 'bg-blue-600 text-white shadow-md' : 
                ['time', 'form'].includes(step) ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="text-xs text-gray-600">Chọn ngày</span>
            </div>
            
            <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
              ['time', 'form'].includes(step) ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step === 'time' ? 'bg-blue-600 text-white shadow-md' : 
                step === 'form' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-xs text-gray-600">Chọn giờ</span>
            </div>
            
            <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
              step === 'form' ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                step === 'form' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-xs text-gray-600">Thông tin</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderStep()}
      </main>
      
      <Footer />
    </div>
  )
}

export default BookingPage
