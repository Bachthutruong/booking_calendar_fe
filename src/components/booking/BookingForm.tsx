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
      onSuccess: (res) => {
        toast({
          title: "成功",
          description: "預約成功！我們將盡快與您聯繫。",
        })
        const id = res.data?.booking?._id
        if (id) {
          navigate(`/booking/success?bookingId=${id}`)
        } else {
          navigate('/')
        }
      },
      onError: (error: any) => {
        toast({
          title: "錯誤",
          description: error.response?.data?.message || "預約時發生錯誤",
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
                {field.label} 為必填
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
                {field.label} 為必填
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
                {field.label} 為必填
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
                <SelectValue placeholder={`選擇 ${field.label}`} />
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
                {field.label} 為必填
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
                {field.label} 為必填
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
        <h2 className="text-3xl font-bold text-gray-900 mb-3">聯絡資訊</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          填寫資訊以完成預約諮詢
        </p>
      </div>

      <div className="space-y-6">
        {/* Booking Summary - compact badges on top */}
        <div className="bg-white/90 backdrop-blur-sm border rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-blue-50 border-blue-200 text-blue-700">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(selectedDate)}</span>
            </div>
            {selectedTimeSlot && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-green-50 border-green-200 text-green-700">
                <Clock className="h-4 w-4" />
                <span>{selectedTimeSlot.includes('-') ? selectedTimeSlot.split('-').map(t => formatTime(t.trim())).join(' - ') : formatTime(selectedTimeSlot)}</span>
              </div>
            )}
            <div className="ml-auto w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline"
                onClick={onBack}
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                重新選擇時間
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-center text-xl text-gray-800">個人資訊</CardTitle>
              <CardDescription className="text-center text-gray-600">
                請完整填寫以下資訊
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
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">尚無欄位</h3>
                    <p className="text-gray-500">
                      管理員尚未設定欄位。如需協助，請與我們聯繫。
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
                    返回
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createBookingMutation.isLoading}
                    className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  >
                    {createBookingMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        處理中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        完成預約
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
