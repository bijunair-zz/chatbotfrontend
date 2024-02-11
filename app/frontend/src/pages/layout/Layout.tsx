import { Outlet, NavLink, Link } from "react-router-dom";

import github from "../../assets/github.svg";

import styles from "./Layout.module.css";

import { useLogin } from "../../authConfig";

import { LoginButton } from "../../components/LoginButton";
import PromoBanner from "../../components/PromoBanner/PromoBanner";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Chat from "../chat/Chat";

const Layout = () => {
    return (
        <div id="__next">
            <PromoBanner />
            <Header />
            {/* <Returns /> */}

            {/* <header className={styles.header} role={"banner"}>
                    <div className={styles.headerContainer}>
                        <Link to="/" className={styles.headerTitleContainer}>
                            <h3 className={styles.headerTitle}>GPT + Enterprise data | Sample</h3>
                        </Link>
                        <nav>
                            <ul className={styles.headerNavList}>
                                <li>
                                    <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        Chat
                                    </NavLink>
                                </li>
                                <li className={styles.headerNavLeftMargin}>
                                    <NavLink to="/qa" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                        Ask a question
                                    </NavLink>
                                </li>
                                <li className={styles.headerNavLeftMargin}>
                                    <a href="https://aka.ms/entgptsearch" target={"_blank"} title="Github repository link">
                                        <img
                                            src={github}
                                            alt="Github logo"
                                            aria-label="Link to github repository"
                                            width="20px"
                                            height="20px"
                                            className={styles.githubLogo}
                                        />
                                    </a>
                                </li>
                            </ul>
                        </nav>
                        <h4 className={styles.headerRightText}>Azure OpenAI + AI Search</h4>
                    
                    </div>
                </header> */}

            <Outlet />
            <Footer />
            <Chat />
        
        {/* // <div className={styles.layout}>
        //     <header className={styles.header} role={"banner"}>
        //         <div className={styles.headerContainer}>
        //             <Link to="/" className={styles.headerTitleContainer}>
        //                 <h3 className={styles.headerTitle}>GPT + Enterprise data | Java Sample</h3>
        //             </Link>
        //             <nav>
        //                 <ul className={styles.headerNavList}>
        //                     <li>
        //                         <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
        //                             Chat
        //                         </NavLink>
        //                     </li>
        //                     <li className={styles.headerNavLeftMargin}>
        //                         <NavLink to="/qa" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
        //                             Ask a question
        //                         </NavLink>
        //                     </li>
        //                     <li className={styles.headerNavLeftMargin}>
        //                         <a href="https://aka.ms/entgptsearch" target={"_blank"} title="Github repository link">
        //                             <img
        //                                 src={github}
        //                                 alt="Github logo"
        //                                 aria-label="Link to github repository"
        //                                 width="20px"
        //                                 height="20px"
        //                                 className={styles.githubLogo}
        //                             />
        //                         </a>
        //                     </li>
        //                 </ul>
        //             </nav>
        //             <h4 className={styles.headerRightText}>Azure OpenAI + Cognitive Search</h4>
        //             {useLogin && <LoginButton />}
        //         </div>
        //     </header>

        //     <Outlet />
        // </div> */}
        </div>
    );
};

export default Layout;
