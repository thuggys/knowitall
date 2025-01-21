'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Video, Lightbulb, Star, Clock, ArrowRight, Bookmark } from 'lucide-react';

const learningResources = [
  {
    title: "TypeScript Deep Dive",
    category: "Programming",
    type: "Course",
    icon: Code,
    description: "Master TypeScript with comprehensive tutorials covering advanced types, decorators, and best practices.",
    duration: "8 hours",
    difficulty: "Intermediate",
    rating: 4.8,
    tags: ["TypeScript", "Web Development", "JavaScript"]
  },
  {
    title: "System Design Fundamentals",
    category: "Architecture",
    type: "Video Series",
    icon: Video,
    description: "Learn how to design scalable systems through real-world case studies and practical examples.",
    duration: "12 hours",
    difficulty: "Advanced",
    rating: 4.9,
    tags: ["System Design", "Architecture", "Scalability"]
  },
  {
    title: "AI & Machine Learning Basics",
    category: "Artificial Intelligence",
    type: "Interactive Guide",
    icon: Lightbulb,
    description: "An interactive journey through the fundamentals of AI and machine learning concepts.",
    duration: "6 hours",
    difficulty: "Beginner",
    rating: 4.7,
    tags: ["AI", "ML", "Data Science"]
  },
  {
    title: "Cloud Computing Essentials",
    category: "Infrastructure",
    type: "Documentation",
    icon: Book,
    description: "Comprehensive guide to modern cloud computing platforms and practices.",
    duration: "10 hours",
    difficulty: "Intermediate",
    rating: 4.6,
    tags: ["Cloud", "DevOps", "Infrastructure"]
  }
];

const LearningHub = () => {
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
            <Book className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm">Your Tech Learning Journey</span>
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
          Learn and Grow
          <div className="text-purple-500">With Expert Resources</div>
        </motion.h1>

        {/* Learning Resources Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
          {learningResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.title}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900 rounded-xl p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Icon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <span className="text-purple-500 text-sm">{resource.category}</span>
                      <h3 className="text-xl font-semibold mt-1">{resource.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-500">{resource.rating}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm">{resource.description}</p>

                <div className="flex flex-wrap gap-2">
                  {resource.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{resource.duration}</span>
                    </div>
                    <span className="text-sm text-gray-500">{resource.difficulty}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-purple-500 hover:text-purple-400"
                  >
                    <Bookmark className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            <span>Explore All Resources</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { label: "Learning Paths", value: "25+", icon: Book },
            { label: "Video Tutorials", value: "100+", icon: Video },
            { label: "Active Learners", value: "5K+", icon: Lightbulb }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-zinc-900 rounded-xl p-6 text-center"
            >
              <stat.icon className="w-6 h-6 text-purple-500 mx-auto mb-4" />
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LearningHub; 