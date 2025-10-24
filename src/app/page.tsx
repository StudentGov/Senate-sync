
// Local image assets (from public/images)
const imgCampusClockTower1 = "/images/campus_clock_tower 1.png";
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
const imgFrame6 = "/images/facebook logo.png";
const imgFrame7 = "/images/instagram logo.png";

export default function HomePage() {
  return (
    <div className="bg-white flex flex-col items-center min-h-screen w-full overflow-x-hidden">

      {/* Hero Section */}
        <section className="hero-section relative w-full h-[500px] flex items-start justify-start overflow-hidden">
          <img src={imgCampusClockTower1} alt="Campus Clock Tower" className="hero-bg absolute inset-0 w-full h-full object-cover" />
          {/* Dark overlay to reduce whiteness and increase vibrancy */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
          <div className="relative z-10 flex flex-col items-start max-w-4xl ml-12 pt-24 pb-8">
          <h1 className="text-5xl md:text-6xl font-kanit text-white mb-6">Student Government</h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl font-kanit">Welcome to your student-led hub for advocacy, support, and connection.</p>
          <div className="flex gap-4">
            <a href="/student/schedule" className="bg-[#febd11] text-white rounded-lg px-8 py-3 font-kanit text-lg hover:bg-[#e6a900] transition">Schedule Appointment</a>
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
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <img src={imgImages2} alt="Andrew Colleran" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Andrew Colleran</h3>
              <p className="text-[#febd11] font-kanit">Student Government President</p>
              <p className="text-gray-600 text-center mt-2">Leading initiatives for student welfare, campus improvements, and academic advocacy.</p>
            </div>
            {/* Sneha Kafle */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <img src={imgWillSmithCHfpa20161} alt="Sneha Kafle" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Sneha Kafle</h3>
              <p className="text-[#febd11] font-kanit">Vice President</p>
              <p className="text-gray-600 text-center mt-2">Representing student voices in university policies and budget allocation decisions.</p>
            </div>
            {/* Dikshyant Thapa */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
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
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {/* Students icon (inline) */}
                  <img src={imgFrame} alt="Students Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Students</h3>
              <p className="text-gray-600 text-center mb-4">Academic advocacy, campus life improvements, and direct representation in university decisions.</p>
              <a href="/student/schedule" className="bg-[#febd11] text-white rounded-lg px-8 py-2 font-kanit hover:bg-[#e6a900] transition">Get Started</a>
            </div>
            {/* Legal Support */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame1} alt="Legal Support Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Legal Support</h3>
              <p className="text-gray-600 text-center mb-4">Free legal consultation and support for student-related issues and campus concerns.</p>
              <a href="/attorney/dashboard" className="bg-[#febd11] text-white rounded-lg px-8 py-2 font-kanit hover:bg-[#e6a900] transition">Get Started</a>
            </div>
            {/* Senate */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame2} alt="Senate Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Senate</h3>
              <p className="text-gray-600 text-center mb-4">Participate in student governance, policy-making, and represent your fellow students' interests.</p>
              <a href="/senate/dashboard" className="bg-[#febd11] text-white rounded-lg px-8 py-2 font-kanit hover:bg-[#e6a900] transition">Get Started</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-[#49306e] py-20" id="contact">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex-1">
            <h2 className="text-3xl font-kanit text-[#49306e] mb-6">Contact Us</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-[#49306e] font-kanit mb-2">Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#febd11]" />
              </div>
              <div>
                <label className="block text-[#49306e] font-kanit mb-2">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#febd11]" />
              </div>
              <div>
                <label className="block text-[#49306e] font-kanit mb-2">Message</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#febd11]" />
              </div>
              <button type="submit" className="bg-[#febd11] text-white rounded-lg px-8 py-3 font-kanit hover:bg-[#e6a900] transition">Send Message</button>
            </form>
          </div>
          {/* Office Info */}
          <div className="flex-1 text-white font-kanit flex flex-col justify-center">
            <h3 className="text-2xl mb-4">Office Information</h3>
            <p className="mb-2">MSU Student Center</p>
            <p className="mb-2">Room 204, 1400 Highway 14 West</p>
            <p className="mb-2">Mankato, MN 56001</p>
            <p className="mb-2">Phone: (507) 389-2611</p>
            <p className="mb-2">Email: studentgov@mnsu.edu</p>
            <div className="flex gap-4 mt-4">
                <a href="https://www.facebook.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition" aria-label="facebook">
                  {/* Inline Facebook SVG for crisp rendering */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current text-[#382450]" aria-hidden="true">
                    <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 5 3.66 9.13 8.44 9.93v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.9h-2.3V22c4.78-.8 8.44-4.93 8.44-9.93z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition" aria-label="instagram">
                  {/* Inline Instagram SVG for crisp rendering */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#382450]" aria-hidden="true">
                    <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm8 3.5c.83 0 1.5.67 1.5 1.5S15.83 8.5 15 8.5 13.5 7.83 13.5 7 14.17 5.5 15 5.5zM12 8.5c2 0 3.5 1.5 3.5 3.5S14 15.5 12 15.5 8.5 14 8.5 12 10 8.5 12 8.5zm0 2c-.83 0-1.5.67-1.5 1.5S11.17 13.5 12 13.5s1.5-.67 1.5-1.5S12.83 10.5 12 10.5z"/>
                  </svg>
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Figma accurate) */}
      <footer className="w-full bg-[#382450] relative pt-16 pb-8 px-0 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Elections</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Live Stream</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Contact</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">State-Wide Government</a></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Contact Info</h3>
            <ul className="space-y-2 text-white/80 font-kanit text-base">
              <li>MSU Student Center, Room 204</li>
              <li>1400 Highway 14 West</li>
              <li>Mankato, MN 56001</li>
              <li>(507) 389-2611</li>
              <li>studentgov@mnsu.edu</li>
            </ul>
          </div>
          {/* Follow Us */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Follow Us</h3>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src={imgFrame6} alt="Facebook" className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src={imgFrame7} alt="Instagram" className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#febd11] mt-12 pt-6">
          <p className="text-center text-white/80 font-kanit text-base">© Minnesota State Student Government 2025</p>
        </div>
      </footer>
    </div>
  );
}
