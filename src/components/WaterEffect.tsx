import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface WaterEffectProps {
  className?: string;
}

const WaterEffect = ({ className = "" }: WaterEffectProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      
      {/* Sun or Moon floating element */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-[80px] -z-10"
        style={{
          top: "-5%",
          right: isDark ? "15%" : "10%",
          background: isDark 
            ? "radial-gradient(circle, rgba(160,200,255,0.4) 0%, rgba(100,50,250,0.1) 70%)"
            : "radial-gradient(circle, rgba(255,200,100,0.6) 0%, rgba(255,100,100,0.2) 70%)"
        }}
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute rounded-full shadow-2xl"
        style={{
          width: isDark ? 80 : 120,
          height: isDark ? 80 : 120,
          top: "8%",
          right: "20%",
          background: isDark 
            ? "linear-gradient(135deg, #e2e8f0, #94a3b8)" // Moon color
            : "linear-gradient(135deg, #ffedd5, #fb923c)", // Sun color
          boxShadow: isDark 
            ? "0 0 60px 10px rgba(226, 232, 240, 0.4)"
            : "0 0 80px 20px rgba(251, 146, 60, 0.6)"
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {isDark && (
          <div className="absolute inset-0 rounded-full" style={{
            boxShadow: "inset -15px -15px 30px rgba(0,0,0,0.2), inset 5px 5px 10px rgba(255,255,255,0.8)"
          }} />
        )}
      </motion.div>

      {/* Stars in dark mode */}
      {isDark && [...Array(15)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* Atmospheric wavy layers (replaces old water) */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        style={{ height: "45%" }}
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "hsl(280, 50%, 40%)" : "hsl(15, 90%, 65%)"} stopOpacity="0.1" />
            <stop offset="100%" stopColor={isDark ? "hsl(280, 50%, 40%)" : "hsl(15, 90%, 65%)"} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "hsl(335, 80%, 40%)" : "hsl(40, 100%, 60%)"} stopOpacity="0.08" />
            <stop offset="100%" stopColor={isDark ? "hsl(335, 80%, 40%)" : "hsl(40, 100%, 60%)"} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "hsl(220, 60%, 30%)" : "hsl(335, 85%, 65%)"} stopOpacity="0.06" />
            <stop offset="100%" stopColor={isDark ? "hsl(220, 60%, 30%)" : "hsl(335, 85%, 65%)"} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Wave 1 - slowest, back */}
        <motion.path
          fill="url(#waveGrad3)"
          animate={{
            d: [
              "M0,120 C200,80 400,140 600,110 C800,80 1000,130 1200,100 L1200,200 L0,200 Z",
              "M0,100 C200,140 400,90 600,130 C800,100 1000,80 1200,120 L1200,200 L0,200 Z",
              "M0,120 C200,80 400,140 600,110 C800,80 1000,130 1200,100 L1200,200 L0,200 Z",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Wave 2 - middle */}
        <motion.path
          fill="url(#waveGrad1)"
          animate={{
            d: [
              "M0,140 C150,110 350,160 550,130 C750,100 950,150 1200,120 L1200,200 L0,200 Z",
              "M0,120 C150,150 350,100 550,140 C750,160 950,110 1200,140 L1200,200 L0,200 Z",
              "M0,140 C150,110 350,160 550,130 C750,100 950,150 1200,120 L1200,200 L0,200 Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Wave 3 - front, fastest */}
        <motion.path
          fill="url(#waveGrad2)"
          animate={{
            d: [
              "M0,160 C100,140 300,170 500,150 C700,130 900,165 1200,145 L1200,200 L0,200 Z",
              "M0,145 C100,165 300,135 500,160 C700,170 900,140 1200,160 L1200,200 L0,200 Z",
              "M0,160 C100,140 300,170 500,150 C700,130 900,165 1200,145 L1200,200 L0,200 Z",
            ],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Glowing atmospheric orbs slowly floating up */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-xl"
          style={{
            width: 20 + i * 10,
            height: 20 + i * 10,
            left: `${15 + i * 14}%`,
            bottom: "-10%",
            background: isDark ? "rgba(160, 50, 255, 0.15)" : "rgba(255, 150, 50, 0.2)",
          }}
          animate={{
            y: [0, -(200 + i * 50)],
            x: [0, (i % 2 === 0 ? 30 : -30)],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.8],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default WaterEffect;
