import { useNavigate } from "react-router-dom";
import { CameraIcon } from "lucide-react";
import { motion } from "framer-motion";

const CameraButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/Scan-Camera");
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9, rotate: -10 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="fixed bottom-8 right-8 z-50 bg-[#800020] hover:bg-[#9a1f36] text-white rounded-full p-5 shadow-xl drop-shadow-lg backdrop-blur-md"
      aria-label="סרוק בגד"
    >
      <motion.div
        whileHover={{
          rotate: [0, -10, 10, -6, 6, 0],
        }}
        transition={{ duration: 0.6 }}
      >
        <CameraIcon size={32} strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  );
};

export default CameraButton;
