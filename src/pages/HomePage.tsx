import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Footer from '@/components/common/Footer'
import { api } from '@/lib/api'
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  CheckCircle, 
  Star,
  ArrowRight,
  Shield,
  Mail,
  Phone
} from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()
  const [footerConfig, setFooterConfig] = useState<any | null>(null)
  const [generalConfig, setGeneralConfig] = useState<any | null>(null)

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await api.get('/system-config')
        setFooterConfig(res.data.configs?.footer || null)
        setGeneralConfig(res.data.configs?.general || null)
      } catch (e) {
        // ignore, UI will fallback to defaults
      }
    }
    fetchConfigs()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{generalConfig?.siteName || 'Booking Calendar'}</h1>
                <p className="text-xs text-gray-500">{generalConfig?.siteDescription || '智慧預約系統'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/login')}
                className="text-gray-600 hover:text-gray-900 text-sm px-3 py-1.5"
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Button>
              <Button 
                onClick={() => navigate('/booking')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                立即預約
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {generalConfig?.siteName || '預約諮詢'}
            <span className="text-blue-600 block">{generalConfig?.siteDescription || '輕鬆'}</span>
          </h2>
          <p className="text-base text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
            選擇合適時間並與我們的專家預約諮詢。
            流程簡單、快速且完全免費。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button 
              onClick={() => navigate('/booking')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <Calendar className="mr-2 h-4 w-4" />
              立即預約
            </Button>
            <Button 
              variant="outline"
              className="px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              <Phone className="mr-2 h-4 w-4" />
              聯絡方式：{footerConfig?.phone || '0123 456 789'}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="text-center hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 pt-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-3 mx-auto">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900">彈性選擇日期</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                查看空檔並選擇符合您行程的時間
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 pt-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-3 mx-auto">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900">時間清楚明確</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                顯示可用時段，方便您選擇
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 pt-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-3 mx-auto">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900">諮詢專家</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                經驗豐富的專家團隊隨時支援您
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-900">運作方式</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="text-base font-semibold mb-2 text-gray-900">選擇日期</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                從直覺式行事曆選擇您想預約的日期
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="text-base font-semibold mb-2 text-gray-900">選擇時間</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                查看可用時段並選擇合適時間
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="text-base font-semibold mb-2 text-gray-900">填寫資訊</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                填寫聯絡資訊與諮詢需求
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-12">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-900">為什麼選擇我們？</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-2 mx-auto">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">100% 免費</h4>
              <p className="text-xs text-gray-600">無任何隱藏費用</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-2 mx-auto">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">高安全性</h4>
              <p className="text-xs text-gray-600">資訊受到保護</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mb-2 mx-auto">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">自動提醒</h4>
              <p className="text-xs text-gray-600">確認與提醒電子郵件</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mb-2 mx-auto">
                <Star className="h-4 w-4 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">高品質</h4>
              <p className="text-xs text-gray-600">經驗豐富的專家</p>
            </div>
          </div>
        </div>
      </main>

      <Footer 
        companyName={footerConfig?.companyName}
        companyDescription={footerConfig?.companyDescription}
        email={footerConfig?.email}
        phone={footerConfig?.phone}
        address={footerConfig?.address}
        support={footerConfig?.support}
      />
    </div>
  )
}

export default HomePage
