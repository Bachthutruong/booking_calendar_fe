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
        bookingConfirmationSubject: '諮詢預約確認',
        bookingConfirmationContent: `
      <h2>諮詢預約確認</h2>
      <p>您好 {{customerName}}，</p>
      <p>我們已收到您的諮詢預約，詳細資訊如下：</p>
      <ul>
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
        <li><strong>Email：</strong> {{customerEmail}}</li>
        {{#if customerPhone}}<li><strong>電話：</strong> {{customerPhone}}</li>{{/if}}
      </ul>
      <p>我們將與您聯繫以確認行程。</p>
      <p>敬上，<br>諮詢團隊</p>
        `,
        bookingReminderSubject: '諮詢預約提醒',
        bookingReminderContent: `
      <h2>諮詢預約提醒</h2>
      <p>您好 {{customerName}}，</p>
      <p>這是提醒您明日的諮詢預約：</p>
      <ul>
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
      </ul>
      <p>請準備好相關資訊以利諮詢順利進行。</p>
      <p>敬上，<br>諮詢團隊</p>
        `,
        bookingCancellationSubject: '取消諮詢預約',
        bookingCancellationContent: `
      <h2>取消諮詢預約</h2>
      <p>您好 {{customerName}}，</p>
      <p>您的諮詢預約已被取消：</p>
      <ul>
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
        {{#if cancellationReason}}<li><strong>取消原因：</strong> {{cancellationReason}}</li>{{/if}}
      </ul>
      <p>若您想重新預約，請與我們聯繫。</p>
      <p>敬上，<br>諮詢團隊</p>
        `,
        adminNewBookingSubject: '新預約待確認',
        adminNewBookingContent: `
      <h2>新的諮詢預約</h2>
      <p>有一筆新的諮詢預約等待確認：</p>
      <ul>
        <li><strong>客戶姓名：</strong> {{customerName}}</li>
        <li><strong>Email：</strong> {{customerEmail}}</li>
        {{#if customerPhone}}<li><strong>電話：</strong> {{customerPhone}}</li>{{/if}}
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
        {{#if notes}}<li><strong>備註：</strong> {{notes}}</li>{{/if}}
      </ul>
        `,
        adminBookingConfirmedSubject: '預約已確認',
        adminBookingConfirmedContent: `
      <h2>諮詢預約已確認</h2>
      <p>與客戶 {{customerName}} 的行程已確認。</p>
      <ul>
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
      </ul>
        `,
        adminBookingCancelledSubject: '預約已取消',
        adminBookingCancelledContent: `
      <h2>諮詢預約已取消</h2>
      <p>與客戶 {{customerName}} 的行程已取消。</p>
      <ul>
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
        {{#if cancellationReason}}<li><strong>取消原因：</strong> {{cancellationReason}}</li>{{/if}}
      </ul>
        `,
        userBookingConfirmedSubject: '您的預約已確認',
        userBookingConfirmedContent: `
      <h2>諮詢預約已確認</h2>
      <p>您好 {{customerName}}，</p>
      <p>您的諮詢預約已確認：</p>
      <ul>
        <li><strong>日期：</strong> {{bookingDate}}</li>
        <li><strong>時間：</strong> {{timeSlot}}</li>
      </ul>
      <p>期待與您見面！</p>
        `
      }

      const defaultGeneral: Record<string, any> = {
        siteName: 'Booking Calendar',
        siteDescription: '諮詢預約系統',
        timezone: 'Asia/Ho_Chi_Minh',
        reminderTime: '09:00',
        reminderHoursBefore: 24
      }

      // Fetch each type to ensure backend defaults are returned if not configured yet
      const [footerRes, emailConfigRes, emailTplRes, generalRes] = await Promise.all([
        api.get('/system-config/footer'),
        api.get('/system-config/email_config'),
        api.get('/system-config/email_template'),
        api.get('/system-config/general')
      ])

      const configs = {
        footer: footerRes.data?.config || {},
        email_config: emailConfigRes.data?.config || {},
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
        title: "更新成功",
        description: `已更新設定 ${type}`
      })
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法更新設定",
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
          <h2 className="text-2xl font-bold text-gray-900">系統設定</h2>
          <p className="text-gray-600">管理頁尾、郵件模板與一般資訊設定</p>
        </div>
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          全部儲存
        </Button>
      </div>

      <Tabs defaultValue="footer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="email_config" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Config
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
              <CardTitle>頁尾設定</CardTitle>
              <CardDescription>頁面底部顯示的資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border">
                <input
                  type="checkbox"
                  id="footer.showFooter"
                  {...register('footer.showFooter')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="footer.showFooter" className="text-sm font-medium text-gray-700 cursor-pointer">
                  顯示頁尾
                </Label>
                <p className="text-xs text-gray-500 ml-2">取消勾選以隱藏頁尾</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="footer.companyName">公司名稱</Label>
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
                  <Label htmlFor="footer.phone">電話</Label>
                  <Input
                    id="footer.phone"
                    {...register('footer.phone')}
                    placeholder="0123 456 789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer.address">地址</Label>
                  <Input
                    id="footer.address"
                    {...register('footer.address')}
                    placeholder="越南胡志明市第一郡 ABC 路 123 號"
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="footer.companyDescription">公司描述</Label>
                <Textarea
                  id="footer.companyDescription"
                  {...register('footer.companyDescription')}
                  placeholder="智慧且便利的諮詢預約系統"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email_config">
          <Card>
            <CardHeader>
              <CardTitle>Email 設定</CardTitle>
              <CardDescription>SMTP 郵件伺服器設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email_config.EMAIL_HOST">SMTP Host</Label>
                  <Input
                    id="email_config.EMAIL_HOST"
                    type="text"
                    {...register('email_config.EMAIL_HOST')}
                    placeholder="smtp.gmail.com"
                    defaultValue={prefill?.email_config?.EMAIL_HOST || ''}
                  />
                  <p className="text-xs text-gray-500">例如: smtp.gmail.com, smtp.office365.com</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_config.EMAIL_PORT">SMTP Port</Label>
                  <Input
                    id="email_config.EMAIL_PORT"
                    type="text"
                    {...register('email_config.EMAIL_PORT')}
                    placeholder="587"
                    defaultValue={prefill?.email_config?.EMAIL_PORT || ''}
                  />
                  <p className="text-xs text-gray-500">通常為 587 (TLS) 或 465 (SSL)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_config.EMAIL_USER">Email 帳號</Label>
                  <Input
                    id="email_config.EMAIL_USER"
                    type="email"
                    {...register('email_config.EMAIL_USER')}
                    placeholder="your_email@gmail.com"
                    defaultValue={prefill?.email_config?.EMAIL_USER || ''}
                  />
                  <p className="text-xs text-gray-500">用於發送郵件的 Email 地址</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_config.EMAIL_PASS">Email 密碼</Label>
                  <Input
                    id="email_config.EMAIL_PASS"
                    type="password"
                    {...register('email_config.EMAIL_PASS')}
                    placeholder="••••••••"
                    defaultValue={prefill?.email_config?.EMAIL_PASS || ''}
                  />
                  <p className="text-xs text-gray-500">Gmail 請使用 App Password</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email_config.EMAIL_FROM">發送者名稱/Email</Label>
                  <Input
                    id="email_config.EMAIL_FROM"
                    type="text"
                    {...register('email_config.EMAIL_FROM')}
                    placeholder="noreply@example.com"
                    defaultValue={prefill?.email_config?.EMAIL_FROM || ''}
                  />
                  <p className="text-xs text-gray-500">顯示在收件人郵件中的發送者地址（可選，預設使用 EMAIL_USER）</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>注意：</strong> 如果未設定，系統將使用 .env 檔案中的預設值。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email_template">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>預約確認郵件</CardTitle>
                <CardDescription>預約成功時寄給客戶的模板</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingConfirmationSubject">郵件主旨</Label>
                  <Input
                    id="email_template.bookingConfirmationSubject"
                    {...register('email_template.bookingConfirmationSubject')}
                    placeholder="諮詢預約確認"
                    defaultValue={prefill?.email_template?.bookingConfirmationSubject || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingConfirmationContent">郵件內容</Label>
                  <Textarea
                    id="email_template.bookingConfirmationContent"
                    {...register('email_template.bookingConfirmationContent')}
                    placeholder="郵件內容..."
                    rows={8}
                    defaultValue={prefill?.email_template?.bookingConfirmationContent || ''}
                  />
                  <p className="text-sm text-gray-500">
                    可使用變數：{`{{customerName}}`}, {`{{customerEmail}}`}, {`{{bookingDate}}`}, {`{{timeSlot}}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>管理員確認後寄給客戶的郵件</CardTitle>
                <CardDescription>行程核准時的模板</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.userBookingConfirmedSubject">郵件主旨</Label>
                  <Input
                    id="email_template.userBookingConfirmedSubject"
                    {...register('email_template.userBookingConfirmedSubject')}
                    placeholder="您的預約已確認"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.userBookingConfirmedContent">郵件內容</Label>
                  <Textarea
                    id="email_template.userBookingConfirmedContent"
                    {...register('email_template.userBookingConfirmedContent')}
                    placeholder="郵件內容..."
                    rows={8}
                    defaultValue={prefill?.email_template?.userBookingConfirmedContent || ''}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>提醒郵件</CardTitle>
                <CardDescription>於前一天寄送的提醒模板</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingReminderSubject">郵件主旨</Label>
                  <Input
                    id="email_template.bookingReminderSubject"
                    {...register('email_template.bookingReminderSubject')}
                    placeholder="諮詢預約提醒"
                    defaultValue={prefill?.email_template?.bookingReminderSubject || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingReminderContent">郵件內容</Label>
                  <Textarea
                    id="email_template.bookingReminderContent"
                    {...register('email_template.bookingReminderContent')}
                    placeholder="郵件內容..."
                    rows={8}
                    defaultValue={prefill?.email_template?.bookingReminderContent || ''}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>取消郵件</CardTitle>
                <CardDescription>行程被取消時的模板</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingCancellationSubject">郵件主旨</Label>
                  <Input
                    id="email_template.bookingCancellationSubject"
                    {...register('email_template.bookingCancellationSubject')}
                    placeholder="取消諮詢預約"
                    defaultValue={prefill?.email_template?.bookingCancellationSubject || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.bookingCancellationContent">郵件內容</Label>
                  <Textarea
                    id="email_template.bookingCancellationContent"
                    {...register('email_template.bookingCancellationContent')}
                    placeholder="郵件內容..."
                    rows={8}
                    defaultValue={prefill?.email_template?.bookingCancellationContent || ''}
                  />
                  <p className="text-sm text-gray-500">
                    可使用變數：{`{{cancellationReason}}`} 作為取消原因
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>管理員通知</CardTitle>
                <CardDescription>寄給管理員的郵件模板</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminNewBookingSubject">主旨：新預約</Label>
                  <Input id="email_template.adminNewBookingSubject" {...register('email_template.adminNewBookingSubject')} placeholder="新預約待確認" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminNewBookingContent">內容：新預約</Label>
                  <Textarea id="email_template.adminNewBookingContent" rows={6} {...register('email_template.adminNewBookingContent')} placeholder="郵件內容..." defaultValue={prefill?.email_template?.adminNewBookingContent || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingConfirmedSubject">主旨：預約已確認</Label>
                  <Input id="email_template.adminBookingConfirmedSubject" {...register('email_template.adminBookingConfirmedSubject')} placeholder="預約已確認" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingConfirmedContent">內容：預約已確認</Label>
                  <Textarea id="email_template.adminBookingConfirmedContent" rows={6} {...register('email_template.adminBookingConfirmedContent')} placeholder="郵件內容..." defaultValue={prefill?.email_template?.adminBookingConfirmedContent || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingCancelledSubject">主旨：預約已取消</Label>
                  <Input id="email_template.adminBookingCancelledSubject" {...register('email_template.adminBookingCancelledSubject')} placeholder="預約已取消" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_template.adminBookingCancelledContent">內容：預約已取消</Label>
                  <Textarea id="email_template.adminBookingCancelledContent" rows={6} {...register('email_template.adminBookingCancelledContent')} placeholder="郵件內容..." defaultValue={prefill?.email_template?.adminBookingCancelledContent || ''} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>一般設定</CardTitle>
              <CardDescription>系統基本資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="general.siteName">系統名稱</Label>
                  <Input
                    id="general.siteName"
                    {...register('general.siteName')}
                    placeholder="Booking Calendar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.siteDescription">系統描述</Label>
                  <Input
                    id="general.siteDescription"
                    {...register('general.siteDescription')}
                    placeholder="諮詢預約系統"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.timezone">時區</Label>
                  <Input
                    id="general.timezone"
                    {...register('general.timezone')}
                    placeholder="Asia/Ho_Chi_Minh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.reminderTime">提醒寄送時間</Label>
                  <Input
                    id="general.reminderTime"
                    {...register('general.reminderTime')}
                    placeholder="09:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general.reminderHoursBefore">開場前幾小時提醒</Label>
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
