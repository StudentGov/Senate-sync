"use client"

import styles from './unauthorized.module.css';
import { Lock } from 'lucide-react';

export default function Unauthorized() {

  return (
    <div className={styles.unauthorizedPage}>
      <div className={styles.card}>
        <Lock size={48} className={styles.icon} />
        <h1 className={styles.title}>Access Denied</h1>
        <p className={styles.description}>You have been redirected to this page due to access restrictions.</p>
        <div className={styles.slideContainer}>
          <div className={styles.slide}>
            <h2 className={styles.slideTitle}>Why You Are Seeing This Page</h2>
            <ul className={styles.reasons}>
              <li className={styles.listItem}>
                <strong>Incorrect Email Domain:</strong> You may have created an account using an email provider other than <code>@mnsu.edu</code>, <code>@go.minnstate.edu</code>, or <code>@minnstate.edu</code>. If you are a student trying to access the scheduling page, please use your campus email.
              </li>
              <li className={styles.listItem}>
                <strong>Attorney or Senate Member:</strong> If you are an attorney or a senate member creating an account for the first time, please contact the Student Government at <a href="mailto:studentgovernment2025@gmail.com" className={styles.link}>studentgovernment2025@gmail.com</a> to request access.
              </li>
            </ul>
          </div>
          <div className={styles.slide}>
            <h2 className={styles.slideTitle}>Next Steps</h2>
            <ul className={styles.reasons}>
              <li className={styles.listItem}>
                <strong>Students:</strong> If you used a non-campus email, you need to delete your current account and create a new one with your campus email.
                To delete your account, go to <strong>Profile</strong> → <strong>Manage Account & Security</strong> → Scroll to the bottom and select <strong>Delete Account</strong>.
              </li>
              <li className={styles.listItem}>
                <strong>Senate Members & Attorneys:</strong> Please contact Student Government at <a href="mailto:studentgovernment2025@gmail.com" className={styles.link}>studentgovernment2025@gmail.com</a> to request access.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
