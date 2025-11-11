import { useState } from "react";
import { motion } from "framer-motion";

const ComponentCarousel = ({ items }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div className="carousel-container">
      {/* Left arrow */}
      <button className="arrow left" onClick={prev}>
        ❮
      </button>

      {/* Center area */}
      <div className="carousel">
        {items.map((Item, i) => {
          const offset = i - index;
          const absOffset = Math.abs(offset);

          // Only render components near the center to avoid clutter
          if (absOffset > 2) return null;

          return (
            <motion.div
              key={i}
              className="carousel-item"
              initial={{ opacity: 0, scale: 0.8, x: offset * 300 }}
              animate={{
                opacity: absOffset === 0 ? 1 : 0.4,
                scale: absOffset === 0 ? 1 : 0.8,
                x: offset * 300,
                zIndex: 2 - absOffset,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
              <Item />
            </motion.div>
          );
        })}
      </div>

      {/* Right arrow */}
      <button className="arrow right" onClick={next}>
        ❯
      </button>
    </div>
  );
};

export default ComponentCarousel;
