'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, MessageSquare, Rocket, Send, Code, Target, Sparkles, CheckCircle } from 'lucide-react';

const benefits = [
  {
    icon: Code,
    title: "Expert Guidance",
    description: "Get personalized mentorship and technical expertise for your project"
  },
  {
    icon: Target,
    title: "Goal-Oriented",
    description: "Clear milestones and structured approach to achieve your project goals"
  },
  {
    icon: Sparkles,
    title: "Innovation Focus",
    description: "Leverage cutting-edge technologies and best practices"
  }
];

const JoinPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'web-development',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

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
            <Users className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm">Let&apos;s Collaborate</span>
        </div>

        <motion.h1 
          className="text-4xl lg:text-6xl font-light leading-tight mb-8"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          Ready to Build
          <div className="text-purple-500">Something Amazing?</div>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-zinc-900 rounded-xl p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Project Type"
                  >
                    <option value="web-development">Web Development</option>
                    <option value="mobile-app">Mobile App</option>
                    <option value="ai-ml">AI/ML Project</option>
                    <option value="blockchain">Blockchain</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Project Details</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                    placeholder="Tell me about your project idea..."
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
                  type="submit"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    whileHover={{ x: 10 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Icon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-gray-500 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Process Steps */}
            <div className="bg-zinc-900 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-purple-500" />
                <span>How It Works</span>
              </h3>
              <div className="space-y-4">
                {[
                  "Fill out the project details form",
                  "I'll review your proposal within 24 hours",
                  "We'll schedule a call to discuss details",
                  "Start building something amazing together"
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Other Ways to Connect</h3>
              <div className="space-y-3">
                <a href="mailto:contact@example.com" className="flex items-center space-x-3 text-sm text-gray-400 hover:text-purple-500">
                  <Mail className="w-4 h-4" />
                  <span>contact@example.com</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-sm text-gray-400 hover:text-purple-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>Schedule a quick chat</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinPage; 