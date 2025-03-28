import styles from './card.module.css'
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import logo from '../../assets/whiteLogo.png'

interface Props{
    title: string,
    text: string,
    userRole: string
}

export default function Card({title, text, userRole}:Props){
    const router = useRouter();
    const { user } = useUser(); // Get user info from Clerk
  
    // Function to handle role-based redirection
    const handleNavigation = (route: string) => {
      if (!user) {
        // Redirect to sign-in if not logged in
        router.push("/auth/sign-in");
      } else {
        // Redirect authenticated users to their dashboard (handled on back end)
        router.push(route);
      }
    };
    return (
        
        <div className={styles.card}>
            <h2 className={styles.cardTitle}>{title}</h2>
            <Image src={logo} alt="MNSU Logo" className={styles.img}/>
            <p className={styles.cardText}>
                {text.split('\n').map((line, index) => (<span key={index}>{line}<br/></span>))}
            </p>
            <button className={styles.navButton} onClick={() => handleNavigation(`/${userRole}/dashboard/currentAgendas`)}>Get Started</button>
      </div>
    )
}