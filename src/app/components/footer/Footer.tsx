import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function StudentGovernmentFooter() {
  return (
    <footer className="footer w-full bg-[#565458] text-white py-8" style={{height: "320px"}}>
      {/* Footer Content */}
      <div className="container mx-auto px-4 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full items-start overflow-y-auto">
          {/* Elections Column */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white border-b border-gray-500 pb-2">ELECTIONS</h2>
            <p className="text-gray-200 text-sm">
              Review the candidate guide, election rules, and latest election results.
            </p>
            <Link href="https://mankato.mnsu.edu/university-life/campus-services/student-government/student-government-elections/" className="inline-flex items-center text-gray-200 hover:text-white text-sm group">
              GET INVOLVED <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Student Government Live Stream Column */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white border-b border-gray-500 pb-2">
              STUDENT GOVERNMENT LIVE STREAM
            </h2>
            <p className="text-gray-200 text-sm">
              Watch live Student Government meetings or view past meetings via the on-demand section.
            </p>
            <Link href="https://www.youtube.com/channel/UCEKDTrz-CvPh4ak-RgeLtbw" className="inline-flex items-center text-gray-200 hover:text-white text-sm group">
              WATCH LIVE <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Contact Student Government Column */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white border-b border-gray-500 pb-2">CONTACT STUDENT GOVERNMENT</h2>
            <div className="space-y-1 text-gray-200 text-sm">
              <p>Minnesota State Student Association</p>
              <p>Minnesota State University, Mankato</p>
              <p>Centennial Student Union</p>
              <p>Mankato, MN 56001</p>
              <div className="pt-1">
                <p>Office Location: CSU 280</p>
                <p>Phone: 507-389-2611</p>
                <p>
                  <Link href="tel:8006273529" className="hover:underline">
                    800-627-3529
                  </Link>{" "}
                  or 711 (MRS/TTY)
                </p>
              </div>
              <div className="flex space-x-4 pt-1">
                <Link href="https://www.facebook.com/mnsustudentgovernment/" className="inline-flex items-center text-gray-200 hover:text-white text-sm group">
                  FACEBOOK <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="https://www.instagram.com/mnsustudentgovernment/" className="inline-flex items-center text-gray-200 hover:text-white text-sm group">
                  INSTAGRAM <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* State-Wide Student Government Column */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white border-b border-gray-500 pb-2">
              STATE-WIDE STUDENT GOVERNMENT
            </h2>
            <p className="text-gray-200 text-sm">
              Statewide association for four-year Minnesota State college and university students.
            </p>
            <Link href="https://www.studentsunited.org/" className="inline-flex items-center text-gray-200 hover:text-white text-sm group">
              STUDENTS UNITED <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
