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
  const [prefill, setPrefill] = useState<any>(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      // Local defaults to backfill missing keys when DB has partial configs
      const defaultEmailTemplate: Record<string, string> = {
        bookingConfirmationSubject: 'Xác nhận đặt lịch tư vấn',
        bookingConfirmationContent: `
      <h2>Xác nhận đặt lịch tư vấn</h2>
      <p>Xin chào {{customerName}},</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lịch tư vấn của bạn với thông tin sau:</p>
      <ul>
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
        <li><strong>Email:</strong> {{customerEmail}}</li>
        {{#if customerPhone}}<li><strong>Số điện thoại:</strong> {{customerPhone}}</li>{{/if}}
      </ul>
      <p>Chúng tôi sẽ liên hệ lại với bạn để xác nhận lịch hẹn.</p>
      <p>Trân trọng,<br>Đội ngũ tư vấn</p>
        `,
        bookingReminderSubject: 'Nhắc nhở lịch tư vấn',
        bookingReminderContent: `
      <h2>Nhắc nhở lịch tư vấn</h2>
      <p>Xin chào {{customerName}},</p>
      <p>Đây là email nhắc nhở về lịch tư vấn của bạn vào ngày mai:</p>
      <ul>
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
      </ul>
      <p>Vui lòng chuẩn bị sẵn sàng cho buổi tư vấn.</p>
      <p>Trân trọng,<br>Đội ngũ tư vấn</p>
        `,
        bookingCancellationSubject: 'Hủy lịch tư vấn',
        bookingCancellationContent: `
      <h2>Hủy lịch tư vấn</h2>
      <p>Xin chào {{customerName}},</p>
      <p>Lịch tư vấn của bạn đã bị hủy:</p>
      <ul>
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
        {{#if cancellationReason}}<li><strong>Lý do hủy:</strong> {{cancellationReason}}</li>{{/if}}
      </ul>
      <p>Vui lòng liên hệ với chúng tôi nếu bạn muốn đặt lịch mới.</p>
      <p>Trân trọng,<br>Đội ngũ tư vấn</p>
        `,
        adminNewBookingSubject: 'Đặt lịch mới cần xác nhận',
        adminNewBookingContent: `
      <h2>Đặt lịch tư vấn mới</h2>
      <p>Có một đặt lịch tư vấn mới cần được xác nhận:</p>
      <ul>
        <li><strong>Tên khách hàng:</strong> {{customerName}}</li>
        <li><strong>Email:</strong> {{customerEmail}}</li>
        {{#if customerPhone}}<li><strong>Số điện thoại:</strong> {{customerPhone}}</li>{{/if}}
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
        {{#if notes}}<li><strong>Ghi chú:</strong> {{notes}}</li>{{/if}}
      </ul>
        `,
        adminBookingConfirmedSubject: 'Lịch đã được xác nhận',
        adminBookingConfirmedContent: `
      <h2>Lịch tư vấn đã được xác nhận</h2>
      <p>Lịch với khách hàng {{customerName}} đã được xác nhận.</p>
      <ul>
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
      </ul>
        `,
        adminBookingCancelledSubject: 'Lịch đã bị hủy',
        adminBookingCancelledContent: `
      <h2>Lịch tư vấn đã bị hủy</h2>
      <p>Lịch với khách hàng {{customerName}} đã bị hủy.</p>
      <ul>
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
        {{#if cancellationReason}}<li><strong>Lý do hủy:</strong> {{cancellationReason}}</li>{{/if}}
      </ul>
        `,
        userBookingConfirmedSubject: 'Lịch của bạn đã được xác nhận',
        userBookingConfirmedContent: `
      <h2>Lịch tư vấn đã được xác nhận</h2>
      <p>Xin chào {{customerName}},</p>
      <p>Lịch tư vấn của bạn đã được xác nhận:</p>
      <ul>
        <li><strong>Ngày:</strong> {{bookingDate}}</li>
        <li><strong>Giờ:</strong> {{timeSlot}}</li>
      </ul>
      <p>Hẹn gặp bạn!</p>
        `
      }

      const defaultGeneral: Record<string, any> = {
        siteName: 'Booking Calendar',
        siteDescription: 'Hệ thống đặt lịch tư vấn',
        timezone: 'Asia/Ho_Chi_Minh',
        reminderTime: '09:00',
        reminderHoursBefore: 24
      }

      // Fetch each type to ensure backend defaults are returned if not configured yet
      const [footerRes, emailTplRes, generalRes] = await Promise.all([
        api.get('/system-config/footer'),
        api.get('/system-config/email_template'),
        api.get('/system-config/general')
      ])

      const configs = {
        footer: footerRes.data?.config || {},
        email_template: { ...defaultEmailTemplate, ...(emailTplRes.data?.config || {}) },
        general: { ...defaultGeneral, ...(generalRes.data?.config || {}) }
      }

      // Prefill entire form with merged configs so all fields show
      setPrefill(configs)
      reset(configs)

      // Explicitly set textarea fields to ensure UI shows content
      const et = configs.email_template as Record<string, any>
      Object.keys(et).forEach((key) => {
        setValue(`email_template.${key}`, et[key] as any, { shouldDirty: false, shouldTouch: false })
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
                    defaultValue={prefill?.email_template?.bookingConfirmationSubject || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingConfirmationContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.bookingConfirmationContent"
                    {...register('email_template.bookingConfirmationContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                    defaultValue={prefill?.email_template?.bookingConfirmationContent || ''}
                  />
                  <p className="text-sm text-gray-500">
                    Sử dụng các biến: {`{{customerName}}`}, {`{{customerEmail}}`}, {`{{bookingDate}}`}, {`{{timeSlot}}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email gửi cho khách sau khi admin xác nhận</CardTitle>
                <CardDescription>Template gửi cho khách khi lịch được duyệt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.userBookingConfirmedSubject">Tiêu đề email</Label>
                  <Input
                    id="email_template.userBookingConfirmedSubject"
                    {...register('email_template.userBookingConfirmedSubject')}
                    placeholder="Lịch của bạn đã được xác nhận"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.userBookingConfirmedContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.userBookingConfirmedContent"
                    {...register('email_template.userBookingConfirmedContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                    defaultValue={prefill?.email_template?.userBookingConfirmedContent || ''}
                  />
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
                    defaultValue={prefill?.email_template?.bookingReminderSubject || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingReminderContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.bookingReminderContent"
                    {...register('email_template.bookingReminderContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                    defaultValue={prefill?.email_template?.bookingReminderContent || ''}
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
                    defaultValue={prefill?.email_template?.bookingCancellationSubject || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingCancellationContent">Nội dung email</Label>
                  <Textarea
                    id="email_template.bookingCancellationContent"
                    {...register('email_template.bookingCancellationContent')}
                    placeholder="Nội dung email..."
                    rows={8}
                    defaultValue={prefill?.email_template?.bookingCancellationContent || ''}
                  />
                  <p className="text-sm text-gray-500">
                    Sử dụng biến: {`{{cancellationReason}}`} cho lý do hủy
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông báo cho Admin</CardTitle>
                <CardDescription>Template email gửi cho quản trị</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminNewBookingSubject">Tiêu đề: Đặt lịch mới</Label>
                  <Input id="email_template.adminNewBookingSubject" {...register('email_template.adminNewBookingSubject')} placeholder="Đặt lịch mới cần xác nhận" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminNewBookingContent">Nội dung: Đặt lịch mới</Label>
                  <Textarea id="email_template.adminNewBookingContent" rows={6} {...register('email_template.adminNewBookingContent')} placeholder="Nội dung email..." defaultValue={prefill?.email_template?.adminNewBookingContent || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingConfirmedSubject">Tiêu đề: Lịch đã xác nhận</Label>
                  <Input id="email_template.adminBookingConfirmedSubject" {...register('email_template.adminBookingConfirmedSubject')} placeholder="Lịch đã được xác nhận" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingConfirmedContent">Nội dung: Lịch đã xác nhận</Label>
                  <Textarea id="email_template.adminBookingConfirmedContent" rows={6} {...register('email_template.adminBookingConfirmedContent')} placeholder="Nội dung email..." defaultValue={prefill?.email_template?.adminBookingConfirmedContent || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingCancelledSubject">Tiêu đề: Lịch đã hủy</Label>
                  <Input id="email_template.adminBookingCancelledSubject" {...register('email_template.adminBookingCancelledSubject')} placeholder="Lịch đã bị hủy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingCancelledContent">Nội dung: Lịch đã hủy</Label>
                  <Textarea id="email_template.adminBookingCancelledContent" rows={6} {...register('email_template.adminBookingCancelledContent')} placeholder="Nội dung email..." defaultValue={prefill?.email_template?.adminBookingCancelledContent || ''} />
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
                  <Label htmlFor="general.siteName">Tên hệ thống</Label>
                  <Input
                    id="general.siteName"
                    {...register('general.siteName')}
                    placeholder="Booking Calendar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.siteDescription">Mô tả hệ thống</Label>
                  <Input
                    id="general.siteDescription"
                    {...register('general.siteDescription')}
                    placeholder="Hệ thống đặt lịch tư vấn"
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
                <div className="space-y-2">
                  <Label htmlFor="general.reminderHoursBefore">Số giờ trước khi bắt đầu để nhắc</Label>
                  <Input
                    id="general.reminderHoursBefore"
                    type="number"
                    {...register('general.reminderHoursBefore')}
                    placeholder="24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SystemConfigManagement
