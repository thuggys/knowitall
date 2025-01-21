import React from 'react';
import { Bot, Target, Users, Globe, Award } from 'lucide-react';

const AboutUsPage = () => {
  const stats = [
    { label: "Clients Worldwide", value: "500+" },
    { label: "Team Members", value: "100+" },
    { label: "Countries Served", value: "50+" },
    { label: "AI Models Deployed", value: "1000+" }
  ];

  const values = [
    {
      icon: Target,
      title: "Innovation",
      description: "Pushing the boundaries of what is possible with AI technology"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working together to create meaningful solutions"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Making a difference across borders and industries"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Striving for the highest quality in everything we do"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-zinc-900 rounded-3xl p-8">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-4 text-sm">
              <Bot className="w-4 h-4" />
              <span>About Us</span>
            </div>
            
            <h2 className="text-5xl font-bold mb-4">
              Our Story
              <div className="text-gray-500">Pioneering AI Innovation</div>
            </h2>
            
            <p className="text-gray-500 mb-8">
              We are a team of passionate innovators dedicated to transforming the way
              businesses operate through cutting-edge AI solutions.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-zinc-900 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-zinc-900 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-gray-500">
            To democratize artificial intelligence and empower organizations of all sizes
            to harness the power of AI for sustainable growth and innovation.
          </p>
        </div>

        {/* Values Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-zinc-900 rounded-xl p-6 space-y-4">
                <value.icon className="w-8 h-8 text-red-500" />
                <h4 className="text-xl font-bold">{value.title}</h4>
                <p className="text-gray-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-zinc-900 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6">Leadership Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "CEO & Founder",
                image: "/team/sarah.jpg"
              },
              {
                name: "Michael Chen",
                role: "CTO",
                image: "/team/michael.jpg"
              },
              {
                name: "Emily Rodriguez",
                role: "Head of AI Research",
                image: "/team/emily.jpg"
              }
            ].map((member, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-zinc-800 rounded-full" />
                <div>
                  <h4 className="font-bold">{member.name}</h4>
                  <p className="text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 