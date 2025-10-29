import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bookingAPI } from '@/lib/api'
import { formatDate, formatTime } from '@/lib/utils'
import { User, ArrowLeft, CheckCircle, Clock, Calendar } from 'lucide-react'

interface CustomField {
  _id: string
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  order: number
  isActive: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

interface BookingFormData {
  [key: string]: any
}

interface BookingFormProps {
  selectedDate: string
  selectedTimeSlot: string
  onBack: () => void
}

const BookingForm = ({ selectedDate, selectedTimeSlot, onBack }: BookingFormProps) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<BookingFormData>()

  // Get public custom fields
  useQuery(
    'customFields',
    () => bookingAPI.getPublicCustomFields(),
    {
      onSuccess: (data) => {
        setCustomFields(data.data.customFields || [])
      }
    }
  )

  // Create booking mutation
  const createBookingMutation = useMutation(
    (bookingData: { customFields: any[]; customerName: string; customerEmail: string; customerPhone?: string }) => bookingAPI.createBooking({
      ...bookingData,
      bookingDate: selectedDate,
      timeSlot: selectedTimeSlot.split('-')[0] // Extract startTime from "startTime-endTime" format
    }),
    {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đặt lịch thành công! Chúng tôi sẽ liên hệ lại với bạn.",
        })
        navigate('/')
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch",
          variant: "destructive"
        })
      }
    }
  )

  const onSubmit = (data: BookingFormData) => {
    // Process custom fields from nested form data
    const processedCustomFields = customFields
      .filter(field => field.isActive)
      .map(field => {
        const rawValue = data?.customFields?.[field._id]
        const value = rawValue === undefined || rawValue === null ? '' : rawValue
        return {
          fieldId: field._id,
          fieldName: field.name,
          value
        }
      })

    createBookingMutation.mutate({
      customFields: processedCustomFields,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone
    })
  }

  const renderCustomField = (field: CustomField) => {
    const fieldName = `customFields.${field._id}`
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type={field.type}
              placeholder={field.placeholder}
              {...register(`customFields.${field._id}` as any, {
                required: field.required,
                minLength: field.validation?.minLength,
                maxLength: field.validation?.maxLength,
                pattern: field.validation?.pattern ? new RegExp(field.validation.pattern) : undefined
              })}
            />
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              placeholder={field.placeholder}
              {...register(`customFields.${field._id}` as any, {
                required: field.required,
                min: field.validation?.min,
                max: field.validation?.max,
                valueAsNumber: true
              })}
            />
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      case 'date':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="date"
              placeholder={field.placeholder}
              {...register(`customFields.${field._id}` as any, {
                required: field.required
              })}
            />
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldName}
              placeholder={field.placeholder}
              {...register(`customFields.${field._id}` as any, {
                required: field.required,
                minLength: field.validation?.minLength,
                maxLength: field.validation?.maxLength
              })}
            />
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              onValueChange={(value) => setValue(fieldName as any, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Chọn ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value || 'empty'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      case 'radio':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldName}-${index}`}
                    value={option.value}
                    {...register(fieldName as any, {
                      required: field.required
                    })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <Label htmlFor={`${fieldName}-${index}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${fieldName}-${index}`}
                    value={option.value}
                    {...register(fieldName as any, {
                      required: field.required
                    })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <Label htmlFor={`${fieldName}-${index}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="text-sm text-red-500">
                {field.label} là bắt buộc
              </p>
            )}
          </div>
        )

      default:
        console.warn(`Unsupported field type: ${field.type}`)
        return null
    }
  }

  return (
    <div className="max-w-full mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
          <User className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Thông tin liên hệ</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Điền thông tin để hoàn tất đặt lịch tư vấn
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50 sticky top-4">
            <CardHeader>
              <CardTitle className="text-center text-purple-800 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Thông tin đặt lịch
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Ngày</p>
                    <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Giờ</p>
                    <p className="text-sm text-gray-600">{formatTime(selectedTimeSlot)}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={onBack}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Chọn lại thời gian
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-center text-xl text-gray-800">Thông tin cá nhân</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Vui lòng điền đầy đủ thông tin bên dưới
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Custom Fields */}
                {customFields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {customFields
                      .filter(field => field.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((field) => renderCustomField(field))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có trường thông tin</h3>
                    <p className="text-gray-500">
                      Quản trị viên chưa cấu hình các trường thông tin. Vui lòng liên hệ để được hỗ trợ.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createBookingMutation.isLoading}
                    className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  >
                    {createBookingMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Hoàn tất đặt lịch
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
