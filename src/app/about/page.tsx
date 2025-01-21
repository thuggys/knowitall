'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { User, Code, Brain, Coffee, Heart, Terminal, Cpu, Globe, Award, BookOpen, Rocket, Zap } from 'lucide-react';

const skills = [
  { name: "Frontend", level: 90, icon: Globe },
  { name: "Backend", level: 85, icon: Terminal },
  { name: "AI/ML", level: 80, icon: Brain },
  { name: "DevOps", level: 75, icon: Cpu }
];

const interests = [
  "Artificial Intelligence",
  "Web Development",
  "Open Source",
  "Cloud Computing",
  "System Design",
  "UI/UX Design"
];

const achievements = [
  {
    year: "2023",
    title: "Tech Conference Speaker",
    description: "Shared insights on modern web development practices at major tech conferences"
  },
  {
    year: "2022",
    title: "Open Source Contributor",
    description: "Active contributor to several popular open-source projects"
  },
  {
    year: "2021",
    title: "Tech Blog Launch",
    description: "Started sharing knowledge and experiences with the developer community"
  }
];

const AboutPage = () => {
  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex items-center space-x-2 mb-6">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <User className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm">About the Nerd</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl lg:text-6xl font-light leading-tight mb-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
            >
              Passionate About
              <div className="text-purple-500">Technology & Innovation</div>
            </motion.h1>
            
            <p className="text-gray-400 text-lg mb-8">
              Hey there! I&apos;m a tech enthusiast who loves exploring and sharing knowledge about the latest in technology. 
              From coding to AI, I&apos;m always excited to learn and create something new.
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>5+ Years Coding</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4" />
                <span>∞ Cups of Coffee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Love for Tech</span>
              </div>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">{skill.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Interests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
        >
          {interests.map((interest) => (
            <motion.div
              key={interest}
              whileHover={{ scale: 1.05 }}
              className="bg-zinc-900 rounded-xl p-6 text-center"
            >
              <Zap className="w-6 h-6 text-purple-500 mx-auto mb-4" />
              <span className="text-gray-300">{interest}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Journey Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-light mb-8 flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-purple-500" />
            <span>My Journey</span>
          </h2>
          
          <div className="space-y-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-24">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-500">{achievement.year}</span>
                  </div>
                </div>
                <div className="flex-grow bg-zinc-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-gray-500 text-sm">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-8 mt-12 text-center"
        >
          <Award className="w-8 h-8 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">Let&apos;s Connect!</h3>
          <p className="text-gray-400 mb-6">Always excited to meet fellow tech enthusiasts and collaborate on interesting projects</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors mx-auto"
          >
            <span>Get in Touch</span>
            <Rocket className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutPage; 