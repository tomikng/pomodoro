'use client'

import React from 'react'

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background">
      {[...Array(7)].map((_, index) => (
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
          background: hsl(0, 0%, 97%);
          z-index: -1;
        }
        .floating-circle {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background-color: hsla(0, 0%, 100%, 0.5);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          animation: float 30s infinite ease-in-out;
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
          top: 60%;
          left: 40%;
          animation-delay: 12s;
        }
        .circle-7 {
          top: 70%;
          left: 80%;
          animation-delay: 15s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(20px, 20px);
          }
          50% {
            transform: translate(40px, -20px);
          }
          75% {
            transform: translate(-20px, 40px);
          }
        }
      `}</style>
    </div>
  )
}

export default AnimatedBackground
