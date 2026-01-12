'use client';

import styles from './FeedbackSection.module.css';

export default function FeedbackSection() {
  return (
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
  );
}

