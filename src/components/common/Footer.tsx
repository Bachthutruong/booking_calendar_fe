import { Calendar, Mail, Phone, MapPin } from 'lucide-react'

interface FooterProps {
  companyName?: string
  companyDescription?: string
  email?: string
  phone?: string
  address?: string
}

const Footer = ({ 
  companyName = "Booking Calendar",
  companyDescription = "智慧且便利的諮詢預約系統",
  email = "info@bookingcalendar.com",
  phone = "0123 456 789",
  address = "越南胡志明市第一郡 ABC 路 123 號"
}: FooterProps) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-primary rounded-lg p-2 mr-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">{companyName}</h3>
            </div>
            <p className="text-gray-400">
              {companyDescription}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">聯絡方式</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>{email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 {companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
