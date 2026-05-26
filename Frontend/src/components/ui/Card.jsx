import { motion } from "framer-motion";

function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`panel p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;
