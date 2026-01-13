'use client';

import { useEffect, useState } from 'react';
import FeedbackSection from './components/FeedbackSection/FeedbackSection';
import styles from './home-page.module.css';
import teamMembersData from './team-members.json';

// Local image assets (from public/images)
const imgCampusClockTower1 = "/images/campus_clock_tower_1.png";
// Logos & icons
const imgMsuLogo = "/images/MSU Logo.png";
const imgFrame = "/images/students.png";
const imgFrame1 = "/images/legal support.png";
const imgFrame2 = "/images/senate.png";
const imgFrame3 = "/images/students.png";
const imgFrame4 = "/images/students.png";
const imgFrame5 = "/images/students.png";

interface TeamMember {
  name: string;
  image: string;
  role: string;
  description: string;
}

interface TeamMembers {
  president: TeamMember;
  vicePresident: TeamMember;
  speaker: TeamMember;
}

export default function HomePage() {
  const [teamMembers, setTeamMembers] = useState<TeamMembers>(teamMembersData);

  useEffect(() => {
    // Fetch team members from API to get any updates
    fetch('/api/get-team-members')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch team members');
        }
        return res.json();
      })
      .then(data => {
        // Only update if we have valid data structure
        if (data && data.president && data.vicePresident && data.speaker) {
          setTeamMembers(data);
        }
      })
      .catch(err => {
        console.error('Error fetching team members:', err);
        // Keep the initial state from teamMembersData if fetch fails
      });
  }, []);

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
            {/* President */}
            <div className={styles.teamCard}>
              <img
                src={teamMembers.president.image}
                alt={teamMembers.president.name}
                className={styles.teamCardImage}
              />
              <h3 className={styles.teamCardName}>
                {teamMembers.president.name}
              </h3>
              <p className={styles.teamCardRole}>{teamMembers.president.role}</p>
              <p className={styles.teamCardDescription}>
                {teamMembers.president.description}
              </p>
            </div>
            {/* Vice President */}
            <div className={styles.teamCard}>
              <img
                src={teamMembers.vicePresident.image}
                alt={teamMembers.vicePresident.name}
                className={styles.teamCardImage}
              />
              <h3 className={styles.teamCardName}>{teamMembers.vicePresident.name}</h3>
              <p className={styles.teamCardRole}>{teamMembers.vicePresident.role}</p>
              <p className={styles.teamCardDescription}>
                {teamMembers.vicePresident.description}
              </p>
            </div>
            {/* Speaker */}
            <div className={styles.teamCard}>
              <img
                src={teamMembers.speaker.image}
                alt={teamMembers.speaker.name}
                className={styles.teamCardImage}
              />
              <h3 className={styles.teamCardName}>
                {teamMembers.speaker.name}
              </h3>
              <p className={styles.teamCardRole}>{teamMembers.speaker.role}</p>
              <p className={styles.teamCardDescription}>
                {teamMembers.speaker.description}
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

      {/* Feedback Section */}
      <FeedbackSection />
    </div>
  );
}
