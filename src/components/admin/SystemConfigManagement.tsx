import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Save, Settings, Mail, Globe } from 'lucide-react'


const SystemConfigManagement = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm()

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/system-config')
      // Set form values
      Object.keys(response.data.configs).forEach(type => {
        Object.keys(response.data.configs[type]).forEach(key => {
          setValue(`${type}.${key}`, response.data.configs[type][key])
        })
      })
    } catch (error) {
      console.error('Fetch configs error:', error)
    }
  }

  const updateConfig = async (type: string, data: any) => {
    try {
      setLoading(true)
      await api.put(`/system-config/${type}`, { config: data })
      toast({
        title: "Cập nhật thành công",
        description: `Cấu hình ${type} đã được cập nhật`
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cấu hình",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (data: any) => {
    Object.keys(data).forEach(type => {
      if (data[type] && Object.keys(data[type]).length > 0) {
        updateConfig(type, data[type])
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h2>
          <p className="text-gray-600">Quản lý cấu hình footer, email template và thông tin chung</p>
        </div>
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          Lưu tất cả
        </Button>
      </div>

      <Tabs defaultValue="footer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="email_template" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Template
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Chung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Footer</CardTitle>
              <CardDescription>Thông tin hiển thị ở cuối trang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="footer.companyName">Tên công ty</Label>
                  <Input
                    id="footer.companyName"
                    {...register('footer.companyName')}
                    placeholder="Booking Calendar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer.email">Email</Label>
                  <Input
                    id="footer.email"
                    {...register('footer.email')}
                    placeholder="info@bookingcalendar.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer.phone">Số điện thoại</Label>
                  <Input
                    id="footer.phone"
                    {...register('footer.phone')}
                    placeholder="0123 456 789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer.address">Địa chỉ</Label>
                  <Input
                    id="footer.address"
                    {...register('footer.address')}
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer.companyDescription">Mô tả công ty</Label>
                <Textarea
                  id="footer.companyDescription"
                  {...register('footer.companyDescription')}
                  placeholder="Hệ thống đặt lịch tư vấn thông minh và tiện lợi"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email_template">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email xác nhận đặt lịch</CardTitle>
                <CardDescription>Template gửi cho khách hàng khi đặt lịch thành công</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingConfirmationSubject">Tiêu đề email</Label>
                  <Input
                    id="email_template.bookingConfirmationSubject"
                    {...register('email_template.bookingConfirmationSubject')}
                    placeholder="Xác nhận đặt lịch tư vấn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingConfirmationContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.bookingConfirmationContent"
                    {...register('email_template.bookingConfirmationContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                  />
                  <p className="text-sm text-gray-500">
                    Sử dụng các biến: {`{{customerName}}`}, {`{{customerEmail}}`}, {`{{bookingDate}}`}, {`{{timeSlot}}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email nhắc nhở</CardTitle>
                <CardDescription>Template gửi nhắc nhở trước 1 ngày</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingReminderSubject">Tiêu đề email</Label>
                  <Input
                    id="email_template.bookingReminderSubject"
                    {...register('email_template.bookingReminderSubject')}
                    placeholder="Nhắc nhở lịch tư vấn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingReminderContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.bookingReminderContent"
                    {...register('email_template.bookingReminderContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email hủy lịch</CardTitle>
                <CardDescription>Template gửi khi lịch bị hủy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingCancellationSubject">Tiêu đề email</Label>
                  <Input
                    id="email_template.bookingCancellationSubject"
                    {...register('email_template.bookingCancellationSubject')}
                    placeholder="Hủy lịch tư vấn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingCancellationContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.bookingCancellationContent"
                    {...register('email_template.bookingCancellationContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                  />
                  <p className="text-sm text-gray-500">
                    Sử dụng biến: {`{{cancellationReason}}`} cho lý do hủy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình chung</CardTitle>
              <CardDescription>Thông tin cơ bản của hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="general.siteName">Tên website</Label>
                  <Input
                    id="general.siteName"
                    {...register('general.siteName')}
                    placeholder="Booking Calendar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.timezone">Múi giờ</Label>
                  <Input
                    id="general.timezone"
                    {...register('general.timezone')}
                    placeholder="Asia/Ho_Chi_Minh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.reminderTime">Giờ gửi nhắc nhở</Label>
                  <Input
                    id="general.reminderTime"
                    {...register('general.reminderTime')}
                    placeholder="09:00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="general.siteDescription">Mô tả website</Label>
                <Textarea
                  id="general.siteDescription"
                  {...register('general.siteDescription')}
                  placeholder="Hệ thống đặt lịch tư vấn"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SystemConfigManagement
