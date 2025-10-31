// Local image assets (from public/images)
const imgCampusClockTower1 = "/images/campus_clock_tower_1.png";
// Person/team avatars - use uploaded photos from public/images
const imgImages2 = "/images/Student_President_Andrew_Colleran.png";
const imgWillSmithCHfpa20161 = "/images/Vice_President_Sneha_Kafle.jpg";
const imgW65Td5ShV2ZUJxmYfoYeV9V9MsrIzSydCdZtO2RrZIc1 = "/images/Speaker_Dikshyant_Thapa.png";
// Logos & icons
const imgMsuLogo = "/images/MSU Logo.png";
const imgFrame = "/images/students.png";
const imgFrame1 = "/images/legal support.png";
const imgFrame2 = "/images/senate.png";
const imgFrame3 = "/images/students.png";
const imgFrame4 = "/images/students.png";
const imgFrame5 = "/images/students.png";

export default function HomePage() {
  return (
    <div className="bg-white flex flex-col items-center min-h-screen w-full overflow-x-hidden">

      {/* Hero Section */}
        <section className="hero-section relative w-full h-[500px] flex items-start justify-start overflow-hidden">
          <img src={imgCampusClockTower1} alt="Campus Clock Tower" className="hero-bg absolute inset-0 w-full h-full object-cover object-center" />
          {/* Dark overlay to reduce whiteness and increase vibrancy */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
          <div className="relative z-10 flex flex-col items-start max-w-4xl ml-12 pt-24 pb-8">
          <h1 className="text-5xl md:text-6xl font-kanit text-white mb-6">Student Government</h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl font-kanit">Welcome to your student-led hub for advocacy, support, and connection.</p>
          <div className="flex gap-4">
            <a href="/attorney" className="bg-[#febd11] text-white rounded-lg px-8 py-3 font-kanit text-lg hover:bg-[#e6a900] transition">Schedule Appointment</a>
            <a href="#learn-more" className="border-2 border-white text-white rounded-lg px-8 py-3 font-kanit text-lg hover:bg-white hover:text-[#49306e] transition">Learn More</a>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full bg-white py-20" id="team">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-kanit text-[#49306e] mb-2">Student Government Team</h2>
            <p className="text-lg text-gray-600">Dedicated students working for your interests</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Andrew Colleran */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(254,189,17,0.4)] cursor-pointer border-2 border-transparent hover:border-[#febd11]">
              <img src={imgImages2} alt="Andrew Colleran" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Andrew Colleran</h3>
              <p className="text-[#febd11] font-kanit">President</p>
              <p className="text-gray-600 text-center mt-2">Leading initiatives for student welfare, campus improvements, and academic advocacy.</p>
            </div>
            {/* Sneha Kafle */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(254,189,17,0.4)] cursor-pointer border-2 border-transparent hover:border-[#febd11]">
              <img src={imgWillSmithCHfpa20161} alt="Sneha Kafle" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Sneha Kafle</h3>
              <p className="text-[#febd11] font-kanit">Vice President</p>
              <p className="text-gray-600 text-center mt-2">Representing student voices in university policies and budget allocation decisions.</p>
            </div>
            {/* Dikshyant Thapa */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(254,189,17,0.4)] cursor-pointer border-2 border-transparent hover:border-[#febd11]">
              <img src={imgW65Td5ShV2ZUJxmYfoYeV9V9MsrIzSydCdZtO2RrZIc1} alt="Dikshyant Thapa" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Dikshyant Thapa</h3>
              <p className="text-[#febd11] font-kanit">Speaker</p>
              <p className="text-gray-600 text-center mt-2">Organizing campus events, student activities, and community engagement programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section className="w-full bg-gray-50 py-20" id="learn-more">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-kanit text-[#49306e] mb-2">What We Offer</h2>
            <p className="text-lg text-gray-600">Comprehensive support for the MSU community</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Students */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(254,189,17,0.4)] cursor-pointer border-2 border-transparent hover:border-[#febd11]">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {/* Students icon (inline) */}
                  <img src={imgFrame} alt="Students Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Students</h3>
              <p className="text-gray-600 text-center">Academic advocacy, campus life improvements, and direct representation in university decisions.</p>
            </div>
            {/* Legal Support */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(254,189,17,0.4)] cursor-pointer border-2 border-transparent hover:border-[#febd11]">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame1} alt="Legal Support Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Legal Support</h3>
              <p className="text-gray-600 text-center">Free legal consultation and support for student-related issues and campus concerns.</p>
            </div>
            {/* Senate */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(254,189,17,0.4)] cursor-pointer border-2 border-transparent hover:border-[#febd11]">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame2} alt="Senate Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Senate</h3>
              <p className="text-gray-600 text-center">Participate in student governance, policy-making, and represent your fellow students' interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-[#49306e] py-20" id="contact">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-kanit font-normal text-white text-center mb-3">Any feedback or Issues?</h2>
          <p className="text-white/90 text-center mb-12 font-kanit text-lg">Send us a message and we'll get back to you.</p>

          <div className="flex flex-col md:flex-row gap-0 items-stretch max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="flex-1 md:pr-12">
              <form className="space-y-6">
                <div>
                  <label className="block text-white font-kanit mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full bg-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label className="block text-white font-kanit mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label className="block text-white font-kanit mb-2">Message</label>
                  <textarea
                    className="w-full bg-white rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#febd11] font-kanit"
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#febd11] text-white rounded-lg px-8 py-3 font-kanit hover:bg-[#e6a900] transition"
                  style={{ borderRadius: '8px' }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Yellow Divider Line */}
            <div className="hidden md:block w-px bg-[#febd11] mx-8 self-stretch" style={{ width: '2px' }}></div>

            {/* Office Info */}
            <div className="flex-1 text-white font-kanit flex flex-col justify-start md:pl-4 mt-8 md:mt-0">
              <h3 className="text-2xl mb-6 font-normal">Office Information</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="font-normal">MSU Student Center</p>
                  <p className="text-white/90">Mankato, MN 56001</p>
                </div>
                <div className="flex items-start gap-3">
                  <img src="/svg_icons/location_symbol.svg" alt="" className="w-3 h-4 mt-1 flex-shrink-0" />
                  <p className="text-white/90">Room 204, 620 West 5 Rd</p>
                </div>
                <div className="flex items-start gap-3">
                  <img src="/svg_icons/phone_symbol.svg" alt="Phone" className="mt-1 flex-shrink-0" style={{ width: '20px', height: '20px' }} />
                  <p className="text-white/90">(507) 389-2611</p>
                </div>
                <div className="flex items-start gap-3">
                  <img src="/svg_icons/mail_symbol.svg" alt="Email" className="w-4 h-4 mt-1 flex-shrink-0" />
                  <p className="text-white/90">studentgov@mnsu.edu</p>
                </div>
              </div>
            </div>
          </div> 
        </div>
      </section>

    </div>
  );
}
