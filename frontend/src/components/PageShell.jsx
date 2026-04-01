import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function PageShell({ role, title, subtitle, children }) {
  return (
    <div className="portal-shell">
      <Sidebar role={role} />
      <div className="portal-main">
        <Navbar title={title} subtitle={subtitle} />
        <motion.main
          className="portal-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.04,
              },
            },
          }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
