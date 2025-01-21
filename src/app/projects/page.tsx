'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Code, Rocket, Github, ExternalLink, Star, GitFork, Eye, Terminal, Boxes, Cpu, Braces, Layers } from 'lucide-react';
import NextImage from 'next/image';

const projects = [
  {
    title: "AI Code Assistant",
    category: "Machine Learning",
    description: "An intelligent coding assistant powered by GPT-4, helping developers write better code faster with real-time suggestions and code completion.",
    tech: ["Python", "PyTorch", "React", "TypeScript"],
    stars: 1240,
    forks: 285,
    views: "12K",
    demoUrl: "#",
    githubUrl: "#",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    featured: true
  },
  {
    title: "Real-time Collaboration Platform",
    category: "Web Development",
    description: "A modern collaboration platform with real-time editing, video calls, and project management tools built with WebRTC and WebSocket.",
    tech: ["Next.js", "Socket.io", "WebRTC", "MongoDB"],
    stars: 890,
    forks: 156,
    views: "8.5K",
    demoUrl: "#",
    githubUrl: "#",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    featured: true
  },
  {
    title: "Blockchain Explorer",
    category: "Blockchain",
    description: "A comprehensive blockchain explorer for multiple networks with real-time transaction tracking and analytics dashboard.",
    tech: ["Solidity", "React", "Node.js", "Web3.js"],
    stars: 645,
    forks: 123,
    views: "5.2K",
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    title: "Cloud Infrastructure Manager",
    category: "DevOps",
    description: "A visual interface for managing cloud infrastructure across multiple providers with automated deployment and scaling.",
    tech: ["Go", "Vue.js", "Docker", "Kubernetes"],
    stars: 780,
    forks: 145,
    views: "6.8K",
    demoUrl: "#",
    githubUrl: "#"
  }
];

const categories = [
  { name: "All Projects", icon: Boxes },
  { name: "Machine Learning", icon: Cpu },
  { name: "Web Development", icon: Braces },
  { name: "DevOps", icon: Layers },
];

const ProjectsPage = () => {
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
            <Code className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm">Innovative Tech Projects</span>
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
          Building the Future
          <div className="text-purple-500">One Project at a Time</div>
        </motion.h1>

        {/* Categories */}
        <motion.div 
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-zinc-900 text-sm text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Featured Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {projects.filter(project => project.featured).map((project) => (
            <motion.div
              key={project.title}
              whileHover={{ scale: 1.02 }}
              className="relative group overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 z-10" />
              <NextImage 
                src={project.image || ''} 
                alt={project.title}
                width={800}
                height={300}
                className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <span className="text-purple-400 text-sm">{project.category}</span>
                <h3 className="text-xl font-semibold mt-2 text-white group-hover:text-purple-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-300 text-sm mt-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tech.map(tech => (
                    <span
                      key={tech}
                      className="text-xs bg-black/50 text-gray-300 px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-4 text-gray-300 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{project.stars}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitFork className="w-4 h-4" />
                      <span>{project.forks}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{project.views}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.a
                      href={project.demoUrl}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-purple-500 rounded-full text-white hover:bg-purple-600"
                    >
                      <Rocket className="w-4 h-4" />
                    </motion.a>
                    <motion.a
                      href={project.githubUrl}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700"
                    >
                      <Github className="w-4 h-4" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Regular Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {projects.filter(project => !project.featured).map((project) => (
            <motion.div
              key={project.title}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-900 rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-purple-500 text-sm">{project.category}</span>
                  <h3 className="text-xl font-semibold mt-1">{project.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.a
                    href={project.demoUrl}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-purple-500/10 rounded-full text-purple-500 hover:bg-purple-500/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    href={project.githubUrl}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700"
                  >
                    <Github className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>

              <p className="text-gray-500 text-sm">{project.description}</p>

              <div className="flex flex-wrap gap-2">
                {project.tech.map(tech => (
                  <span
                    key={tech}
                    className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="w-4 h-4" />
                  <span>{project.forks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{project.views}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-8 mt-12 text-center"
        >
          <Terminal className="w-8 h-8 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">Want to Collaborate?</h3>
          <p className="text-gray-400 mb-6">Let&apos;s build something amazing together</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors mx-auto"
          >
            <span>Start a Project</span>
            <Rocket className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectsPage; 