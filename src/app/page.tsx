import styles from './home-page.module.css';

// Local image assets (from public/images)
const imgCampusClockTower1 = "/images/campus_clock_tower_1.png";
// Person/team avatars - use uploaded photos from public/images
const imgImages2 = "/images/Student_President_Andrew_Colleran.png";
const imgWillSmithCHfpa20161 = "/images/Vice_President_Sneha_Kafle.jpg";
const imgW65Td5ShV2ZUJxmYfoYeV9V9MsrIzSydCdZtO2RrZIc1 =
  "/images/Speaker_Dikshyant_Thapa.png";
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
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <img
          src={imgCampusClockTower1}
          alt="Campus Clock Tower"
          className={styles.heroBackgroundImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Student Government
          </h1>
          <p className={styles.heroSubtitle}>
            Welcome to your student-led hub for advocacy, support, and
            connection.
          </p>
          <div className={styles.heroButtonGroup}>
            <a
              href="/attorney"
              className={styles.heroButtonPrimary}
            >
              Schedule Appointment
            </a>
            <a
              href="#learn-more"
              className={styles.heroButtonSecondary}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection} id="team">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Student Government Team
            </h2>
            <p className={styles.sectionSubtitle}>
              Dedicated students working for your interests
            </p>
          </div>
          <div className={styles.teamCardGrid}>
            {/* Andrew Colleran */}
            <div className={styles.teamCard}>
              <img
                src={imgImages2}
                alt="Andrew Colleran"
                className={styles.teamCardImage}
              />
              <h3 className={styles.teamCardName}>
                Andrew Colleran
              </h3>
              <p className={styles.teamCardRole}>President</p>
              <p className={styles.teamCardDescription}>
                The chief administrative officer of Student Government. 
                Completes the appointment of all unelected Student Government positions and spearheads the advocacy for the students.
              </p>
            </div>
            {/* Sneha Kafle */}
            <div className={styles.teamCard}>
              <img
                src={imgWillSmithCHfpa20161}
                alt="Sneha Kafle"
                className={styles.teamCardImage}
              />
              <h3 className={styles.teamCardName}>Sneha Kafle</h3>
              <p className={styles.teamCardRole}>Vice President</p>
              <p className={styles.teamCardDescription}>
                The supporting member to the President and Speaker. 
                Set to advertise, recruit, and monitor for any Student Government workgroups. 
              </p>
            </div>
            {/* Dikshyant Thapa */}
            <div className={styles.teamCard}>
              <img
                src={imgW65Td5ShV2ZUJxmYfoYeV9V9MsrIzSydCdZtO2RrZIc1}
                alt="Dikshyant Thapa"
                className={styles.teamCardImage}
              />
              <h3 className={styles.teamCardName}>
                Dikshyant Thapa
              </h3>
              <p className={styles.teamCardRole}>Speaker</p>
              <p className={styles.teamCardDescription}>
                Designated person for administrative correspondence with Student Government, 
                and the Parliamentary for Student Government's Senate meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section className={styles.offeringsSection} id="learn-more">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              What We Offer
            </h2>
            <p className={styles.sectionSubtitle}>
              Comprehensive support for the MSU community
            </p>
          </div>
          <div className={styles.offeringsCardGrid}>
            {/* Students */}
            <div className={styles.offeringCard}>
              <div className={styles.offeringIconContainer}>
                <img
                  src={imgFrame}
                  alt="Students Icon"
                  className={styles.offeringIcon}
                />
              </div>
              <h3 className={styles.offeringTitle}>
                Students
              </h3>
              <p className={styles.offeringDescription}>
                Academic advocacy, campus life improvements, and direct
                representation in university decisions.
              </p>
            </div>
            {/* Legal Support */}
            <div className={styles.offeringCard}>
              <div className={styles.offeringIconContainer}>
                <img
                  src={imgFrame1}
                  alt="Legal Support Icon"
                  className={styles.offeringIcon}
                />
              </div>
              <h3 className={styles.offeringTitle}>
                Legal Support
              </h3>
              <p className={styles.offeringDescription}>
                Free legal consultation and support for student-related issues
                and campus concerns.
              </p>
            </div>
            {/* Senate */}
            <div className={styles.offeringCard}>
              <div className={styles.offeringIconContainer}>
                <img
                  src={imgFrame2}
                  alt="Senate Icon"
                  className={styles.offeringIcon}
                />
              </div>
              <h3 className={styles.offeringTitle}>
                Senate
              </h3>
              <p className={styles.offeringDescription}>
                Participate in student governance, policy-making, and represent
                your fellow students' interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection} id="contact">
        <div className={styles.contactContainer}>
          <h2 className={styles.contactTitle}>
            Any feedback or Issues?
          </h2>
          <p className={styles.contactSubtitle}>
            Send us a message and we'll get back to you.
          </p>

          <div className={styles.contactContent}>
            {/* Contact Form */}
            <div className={styles.contactFormContainer}>
              <form className={styles.contactForm}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Name
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Message
                  </label>
                  <textarea
                    className={styles.formTextarea}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.formSubmitButton}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Yellow Divider Line */}
            <div className={styles.contactDivider}></div>

            {/* Office Info */}
            <div className={styles.officeInfoContainer}>
              <h3 className={styles.officeInfoTitle}>Office Information</h3>
              <div className={styles.officeInfoList}>
                <div>
                  <p className={styles.officeInfoTextBold}>MSU Student Center</p>
                  <p className={styles.officeInfoText}>Mankato, MN 56001</p>
                </div>
                <div className={styles.officeInfoItem}>
                  <img
                    src="/svg_icons/location_symbol.svg"
                    alt=""
                    className={`${styles.officeInfoIcon} ${styles.locationIcon}`}
                  />
                  <p className={styles.officeInfoText}>Room 204, 620 West 5 Rd</p>
                </div>
                <div className={styles.officeInfoItem}>
                  <img
                    src="/svg_icons/phone_symbol.svg"
                    alt="Phone"
                    className={`${styles.officeInfoIcon} ${styles.phoneIcon}`}
                  />
                  <p className={styles.officeInfoText}>(507) 389-2611</p>
                </div>
                <div className={styles.officeInfoItem}>
                  <img
                    src="/svg_icons/mail_symbol.svg"
                    alt="Email"
                    className={`${styles.officeInfoIcon} ${styles.mailIcon}`}
                  />
                  <a 
                    href="mailto:studentgov@mnsu.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.officeInfoText}
                  >
                    studentgov@mnsu.edu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
