// src/NeonParticles.jsx
import React, { useEffect, useRef } from "react";

const NeonParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];
    let animationId;

    // Web3 Color Palette - Neons only
    const neonColors = [
      "#00ff88", // Neon Green
      "#00d4ff", // Electric Blue
      "#a855f7", // Purple
      "#22d3ee", // Cyan
      "#ec4899", // Pink
      "#00ff88", // More green for dominance
      "#00d4ff", // More blue for balance
    ];

    // Resize canvas to screen size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Create particles
    const createParticles = () => {
      particles = [];
      const numParticles = Math.min(100, Math.floor(window.innerWidth / 15));
      for (let i = 0; i < numParticles; i++) {
        const color = neonColors[Math.floor(Math.random() * neonColors.length)];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.5 + 1,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          color: color,
          glow: Math.random() * 20 + 15,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    createParticles();

    // Draw particles
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      for (let p of particles) {
        // Pulsing glow effect
        const pulse = Math.sin(time * p.pulseSpeed * 10 + p.pulsePhase) * 0.3 + 0.7;
        const currentGlow = p.glow * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = currentGlow;
        ctx.shadowColor = p.color;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        // Bounce effect at screen edges
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, particles[i].color);
            gradient.addColorStop(1, particles[j].color);

            ctx.strokeStyle = gradient;
            ctx.globalAlpha = 0.1 * (1 - dist / 120);
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
};

export default NeonParticles;
