'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Code, Rocket, Book, Terminal, Video, Lightbulb, Brain, Blocks, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Learn Modern Development",
    description: "Master the latest technologies and frameworks used in real-world applications"
  },
  {
    icon: Terminal,
    title: "Hands-on Projects",
    description: "Build the exact same apps I build in my daily work, with step-by-step guidance"
  },
  {
    icon: Blocks,
    title: "Full-Stack Focus",
    description: "From frontend to backend, learn the complete development stack I use professionally"
  },
  {
    icon: Video,
    title: "Live Coding Sessions",
    description: "Watch me code and explain my thought process as I build features from scratch"
  },
  {
    icon: Sparkles,
    title: "Best Practices & Tips",
    description: "Learn the coding practices, tools, and shortcuts I've learned over the years"
  },
  {
    icon: Book,
    title: "Real-World Experience",
    description: "Get insights from my experience building production applications"
  }
];

const ProjectsPage = () => {
  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex items-center space-x-2 mb-6">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Code className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm">Learn From Experience</span>
        </div>

        <motion.h1 
          className="text-4xl lg:text-6xl font-light leading-tight mb-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          Learn Development
          <div className="text-purple-500">The Way I Do It</div>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-zinc-400 max-w-3xl"
        >
          Coming soon: In-depth courses where I&apos;ll teach you how to build real applications 
          using the same technologies and practices I use in my daily work.
        </motion.p>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05 }}
                className="bg-zinc-900 rounded-xl p-6 space-y-4 cursor-pointer group"
                onClick={() => {
                  document.querySelector('#waitlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="p-3 bg-purple-500/10 rounded-lg w-fit">
                  <Icon className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-purple-500 transition-colors">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div 
          id="waitlist"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-8 mt-12 text-center"
        >
          <Lightbulb className="w-8 h-8 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">Get Early Access</h3>
          <p className="text-gray-400 mb-6">Be the first to know when I release new courses</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors mx-auto"
          >
            <span>Join the Waitlist</span>
            <Rocket className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-zinc-500 text-sm"
        >
          🚀 First Course Coming Soon
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectsPage; 