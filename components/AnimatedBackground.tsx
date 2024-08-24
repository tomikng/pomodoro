'use client'

import React from 'react'

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`floating-circle circle-${index + 1}`} />
      ))}
      <style jsx>{`
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
          z-index: -1;
        }
        .floating-circle {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background-color: rgba(100, 100, 255, 0.3);
          animation: float 20s infinite ease-in-out;
        }
        .circle-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        .circle-2 {
          top: 20%;
          right: 20%;
          animation-delay: 5s;
        }
        .circle-3 {
          bottom: 30%;
          left: 30%;
          animation-delay: 7s;
        }
        .circle-4 {
          bottom: 10%;
          right: 10%;
          animation-delay: 3s;
        }
        .circle-5 {
          top: 50%;
          left: 50%;
          animation-delay: 10s;
        }

        .circle-6 {
          top: 30%;
          left: 10%;
          animation-delay: 10s;
        }

        .circle-7 {
          top: 70%;
          left: 80%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, 50px) scale(1.1);
          }
          50% {
            transform: translate(100px, -50px) scale(0.9);
          }
          75% {
            transform: translate(-50px, 100px) scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}

export default AnimatedBackground
