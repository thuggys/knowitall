'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Rocket, Brain, Code, Globe, Users } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: "Learning Hub",
    description: "Access curated tech tutorials, courses and learning paths across web dev, AI, cloud and more",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Tech Blog", 
    description: "Read and share insightful articles about programming, new technologies and best practices",
    icon: Code,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Discoveries",
    description: "Stay up to date with the latest tech news, tools and innovations from around the web",
    icon: Globe,
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Community",
    description: "Connect with other developers, share knowledge and grow together",
    icon: Users,
    color: "from-orange-500 to-yellow-500"
  }
];

// Add this at the top of the file after imports
const clipPathStyle = `
.polygon-clip {
  clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%);
}
`;

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-zinc-900">
      <div className="absolute inset-0 -z-10 pointer-events-none bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative"
      >
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-3 mb-8"
            >
              <Brain className="w-12 h-12 text-purple-500" />
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500">
                KnowItAll
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed"
            >
              Your one-stop platform for learning new technologies, sharing knowledge, and discovering the latest in tech.
            </motion.p>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-32"
        >
          <div className="mx-auto max-w-7xl">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * index }}
                  className={`flex items-start gap-x-8 mb-24 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 relative group p-8`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="relative">
                      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 relative hidden md:block">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 blur-3xl rounded-full`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative isolate mt-32 px-6 py-16 sm:py-24 lg:px-8"
        >
          <div className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-500 to-pink-500 opacity-30 polygon-clip" />
          </div>
          <div className="mx-auto max-w-2xl text-center relative">
            <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 sm:text-5xl">
              Ready to Start Learning?
            </h2>
            <p className="mt-6 text-lg leading-8 text-zinc-300">
              Join our community of tech enthusiasts and start your learning journey today.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group mt-10 inline-flex items-center gap-x-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 px-10 py-4 text-lg font-semibold text-white shadow-sm hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300"
            >
              <Link href="/learning">
                <span>Get Started</span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.button>
          </div>
        </motion.div>

      </motion.div>
      <style jsx>{clipPathStyle}</style>
    </div>
  );
};

export default AboutPage;