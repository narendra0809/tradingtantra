import React, { useEffect, useRef, useState } from "react";
import StockCard from "../../Components/Dashboard/StockCard";
import Loader from "../../Components/Loader";

const LazyStockCard = ({ title, data, loading, error }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <StockCard title={title} data={data} loading={loading} error={error} />
      ) : (
        <div className="flex h-[200px] items-center justify-center">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default LazyStockCard;