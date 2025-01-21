'use client'

import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:max-w-2xl"
        >
          <div className="flex items-center space-x-2 mb-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Bot className="w-4 h-4 text-purple-500" />
            </motion.div>
            <span className="text-sm">Tech enthusiast sharing everything!</span>
          </div>
          
          <motion.h1 
            className="text-4xl lg:text-6xl font-light leading-tight mb-4"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Because knowing
            <div className="text-purple-500">everything is</div>
            <div className="text-purple-500">never enough</div>
          </motion.h1>
          
          <motion.p 
            className="text-zinc-600 text-base lg:text-lg mb-8 lg:mb-12 leading-relaxed max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            From cutting-edge tech to obscure programming languages, join me on a journey through
            the endless realm of technology. Because there&apos;s always something new to learn!
          </motion.p>
          
          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
            >
              Start Learning
            </motion.button>
            <motion.div 
              className="flex items-center space-x-2 text-zinc-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Bot className="w-3 h-3" />
              <span>Dive into a world of endless tech discoveries</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full lg:w-[400px] bg-zinc-950 rounded-2xl overflow-hidden"
        >
          {/* Chat interface content */}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-zinc-900 rounded-3xl p-4 md:p-8 overflow-x-auto" // Added overflow-x-auto
      >
        <div className="bg-zinc-900 rounded-xl overflow-hidden min-w-[320px]"> {/* Added min-width */}
          <div className="flex flex-wrap items-center justify-between p-3 border-b border-zinc-800 gap-2"> {/* Added flex-wrap and gap */}
            <div className="flex flex-wrap space-x-2 gap-y-2"> {/* Added flex-wrap and vertical gap */}
              <button className="px-4 py-1 rounded text-zinc-400 hover:text-zinc-300">HTML</button>
              <button className="px-4 py-1 rounded text-zinc-400 hover:text-zinc-300">CSS</button>
              <button className="px-4 py-1 rounded bg-purple-600 text-white">TS</button>
            </div>
            <button className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-300">
              <Bot className="w-4 h-4" />
              <span className="text-sm">Copy code</span>
            </button>
          </div>

          <div className="p-4 font-mono text-sm overflow-x-auto"> {/* Added overflow-x-auto */}
            <div className="space-y-1 whitespace-nowrap"> {/* Added whitespace-nowrap */}
              <div className="flex">
                <span className="w-8 text-zinc-600">1</span>
                <span className="text-purple-400">interface</span>
                <span className="text-blue-400 ml-2">TechInnovation</span>
                <span className="text-white ml-2">{'{'}</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">2</span>
                <span className="ml-8 text-zinc-400">name:</span>
                <span className="text-blue-400 ml-2">string</span>
                <span className="text-white">;</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">3</span>
                <span className="ml-8 text-zinc-400">impact:</span>
                <span className="text-blue-400 ml-2">string</span>
                <span className="text-white">;</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">4</span>
                <span className="text-white">{'}'}</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">5</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">6</span>
                <span className="text-purple-400">const</span>
                <span className="text-blue-400 ml-2">techLeaders</span>
                <span className="text-white">:</span>
                <span className="text-blue-400 ml-2">TechInnovation</span>
                <span className="text-white">[] = [</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">7</span>
                <span className="ml-8 text-white">{'{'}</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">8</span>
                <span className="ml-12 text-zinc-400">name:</span>
                <span className="text-green-400 ml-2">&apos;OpenAI&apos;</span>
                <span className="text-white">,</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">9</span>
                <span className="ml-12 text-zinc-400">impact:</span>
                <span className="text-green-400 ml-2">&apos;Revolutionizing AI accessibility&apos;</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">10</span>
                <span className="ml-8 text-white">{'}'}</span>
                <span className="text-white">,</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">11</span>
                <span className="ml-8 text-white">{'{'}</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">12</span>
                <span className="ml-12 text-zinc-400">name:</span>
                <span className="text-green-400 ml-2">&apos;Vercel&apos;</span>
                <span className="text-white">,</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">13</span>
                <span className="ml-12 text-zinc-400">impact:</span>
                <span className="text-green-400 ml-2">&apos;Transforming web deployment&apos;</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">14</span>
                <span className="ml-8 text-white">{'}'}</span>
              </div>
              <div className="flex">
                <span className="w-8 text-zinc-600">15</span>
                <span className="text-white">];</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 text-zinc-400 text-sm">
            <p className="break-words">Explore how these tech innovators are shaping the future of technology and development.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;