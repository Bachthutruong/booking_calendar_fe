import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Footer from '@/components/common/Footer'
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
                <h1 className="text-lg font-bold text-gray-900">Booking Calendar</h1>
                <p className="text-xs text-gray-500">Hệ thống đặt lịch thông minh</p>
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
                Đặt lịch ngay
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
            Đặt lịch tư vấn
            <span className="text-blue-600 block">dễ dàng</span>
          </h2>
          <p className="text-base text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
            Chọn thời gian phù hợp và đặt lịch tư vấn với chuyên gia của chúng tôi. 
            Quy trình đơn giản, nhanh chóng và hoàn toàn miễn phí.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button 
              onClick={() => navigate('/booking')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Đặt lịch ngay
            </Button>
            <Button 
              variant="outline"
              className="px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              <Phone className="mr-2 h-4 w-4" />
              Liên hệ: 0123 456 789
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
              <CardTitle className="text-base font-semibold text-gray-900">Chọn ngày linh hoạt</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Xem lịch trống và chọn thời gian phù hợp với lịch trình của bạn
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 pt-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-3 mx-auto">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900">Thời gian rõ ràng</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Hiển thị các khung giờ khả dụng để bạn dễ dàng lựa chọn
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-md transition-all duration-300 border-0 shadow-sm bg-white">
            <CardHeader className="pb-3 pt-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-3 mx-auto">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900">Chuyên gia tư vấn</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Đội ngũ chuyên gia giàu kinh nghiệm sẵn sàng hỗ trợ bạn
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-900">Cách thức hoạt động</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="text-base font-semibold mb-2 text-gray-900">Chọn ngày</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chọn ngày bạn muốn đặt lịch tư vấn từ lịch trực quan
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="text-base font-semibold mb-2 text-gray-900">Chọn giờ</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Xem các khung giờ khả dụng và chọn thời gian phù hợp
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-base font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="text-base font-semibold mb-2 text-gray-900">Điền thông tin</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Điền thông tin liên hệ và nhu cầu tư vấn của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-12">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-900">Tại sao chọn chúng tôi?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-2 mx-auto">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">Miễn phí 100%</h4>
              <p className="text-xs text-gray-600">Không có chi phí ẩn</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-2 mx-auto">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">Bảo mật cao</h4>
              <p className="text-xs text-gray-600">Thông tin được bảo vệ</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mb-2 mx-auto">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">Nhắc nhở tự động</h4>
              <p className="text-xs text-gray-600">Email xác nhận & nhắc nhở</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mb-2 mx-auto">
                <Star className="h-4 w-4 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-1 text-sm text-gray-900">Chất lượng cao</h4>
              <p className="text-xs text-gray-600">Chuyên gia giàu kinh nghiệm</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
