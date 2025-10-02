import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Smartphone, FileText, UserPlus, Layout, Download, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const features = [
  {
    icon: <Award className="w-12 h-12 text-blue-600 mb-4" />,
    title: 'Beautiful Templates',
    description: 'Choose from a variety of modern, clean resume layouts that stand out.',
  },
  {
    icon: <Smartphone className="w-12 h-12 text-blue-600 mb-4" />,
    title: 'Mobile Friendly',
    description: 'Edit your resume on any device—phone, tablet, or desktop.',
  },
  {
    icon: <FileText className="w-12 h-12 text-blue-600 mb-4" />,
    title: 'Easy Export',
    description: 'Download your resume as PDF' ,
  },
];

const steps = [
  {
    icon: <UserPlus className="w-10 h-10 text-purple-600 mb-2" />,
    title: 'Sign Up',
    desc: 'Create your free account and get started in seconds.',
  },
  {
    icon: <Layout className="w-10 h-10 text-purple-600 mb-2" />,
    title: 'Select Template',
    desc: 'Choose a design that fits your style and profession.',
  },
  {
    icon: <Download className="w-10 h-10 text-purple-600 mb-2" />,
    title: 'Export & Share',
    desc: 'Download as PDF ',
  },
];

const templates = [
  {
    title: 'Modern',
    description: 'A clean, two-column layout perfect for professionals.',
    imageSrc: '/images/template-modern.jpg',
  },
 
  {
    title: 'ATS-Friendly',
    description: 'Optimized for passing through applicant tracking systems.',
    imageSrc: '/images/template-ats.jpg',
  },
];

// --- UPDATED PRICING FOR CREDIT SYSTEM ---
const pricing = [
  {
    title: 'Buy Credits',
    price: 'KES 500',
    description: 'for 300 credits',
    features: [
        '300 Credits on Purchase',
        '100 Credits per PDF Download',
        'Access to All Templates',
        'AI-Powered Content Suggestions'
    ],
    cta: 'Get Credits',
    popular: true,
  },
];

// --- UPDATED FAQ FOR CREDIT SYSTEM ---
const faqs = [
  { q: 'Can I change my template later?', a: 'Yes! You can switch templates anytime. Credits are only used when you download the final PDF.' },
  { q: 'What file format do I get?', a: 'You can download your finished resume as a high-quality PDF, ready for job applications.' },
  { q: 'Do credits expire?', a: 'No! Your credits never expire. Use them whenever you need to download a resume.' },
];

export default function Homepage() {
  return (
    <div className="flex flex-col">
      <Navbar />

      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Build Your Professional Resume
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Pick from beautiful, easy-to-customize templates and create your resume in minutes.
          </motion.p>
          <div className="flex justify-center">
            <Link
              to="/select-template"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            
          </div>
        </div>
      </header>

      {/* Template Showcase Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Explore Our Templates</h2>
          <p className="text-gray-600">Professionally designed templates to get you started.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {templates.map((template, i) => (
            <motion.div
              key={i}
              className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <img src={template.imageSrc} alt={`${template.title} template preview`} className="w-full object-cover object-top h-96 border-b" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                <p className="text-gray-600">{template.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- NEW VIDEO TUTORIAL SECTION --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">See How It Works</h2>
          <div className="bg-black rounded-lg shadow-2xl overflow-hidden">
            <video
              controls
              className="w-full"
              src="/videos/tutorials.mp4" // Path to your video in the 'public' folder
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-gray-600">Everything you need to craft a standout resume, all in one place.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="text-center p-6 border rounded-lg bg-white hover:shadow-lg transition"
              whileHover={{ scale: 1.03 }}
            >
              {f.icon}
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600">Just three simple steps to your perfect resume.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="bg-gray-50 p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="flex items-center justify-center mb-4">{s.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-center">{s.title}</h3>
              <p className="text-gray-600 text-center">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-600">One-time payment for a bundle of credits.</p>
        </div>
        <div className="max-w-md mx-auto grid grid-cols-1 gap-8 px-4">
          {pricing.map((p, i) => (
            <motion.div
              key={i}
              className={`p-6 rounded-lg border bg-white ${p.popular ? 'border-blue-600 shadow-lg' : 'border-gray-200'}`}
              whileHover={{ scale: 1.02 }}
            >
              {p.popular && <div className="text-sm text-white bg-blue-600 inline-block px-2 py-1 rounded-full mb-2">Best Value</div>}
              <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
              <p className="text-4xl font-extrabold mb-1">{p.price}</p>
              <p className="text-gray-500 mb-4">{p.description}</p>
              <ul className="text-gray-600 mb-6 space-y-2 text-left">
                {p.features.map((f, j) => (<li key={j} className="flex items-center"><span className="text-green-500 mr-2">✔</span>{f}</li>))}
              </ul>
              <Link
                to={'/paywall'}
                className={`block text-center px-4 py-2 rounded-lg font-semibold ${p.popular ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-600 hover:bg-blue-50'} transition`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-5xl mx-auto space-y-6 px-4">
          {faqs.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-6 rounded-lg border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">{item.q}</h4>
              </div>
              <p className="text-gray-600">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
        <p className="mb-8">Start crafting your standout resume today.</p>
        <Link
          to="/select-template"
          className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </Link>
      </section>

      {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
          {/* Column 1: Brand and Copyright */}
          <div>
            <h3 className="text-white font-bold text-xl mb-2">Resume Builder</h3>
            <p className="mb-4">© {new Date().getFullYear()} All rights reserved.</p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <Link to="/" className="hover:text-white text-sm">Home</Link>
              <Link to="/select-template" className="hover:text-white text-sm">Templates</Link>
            </div>
          </div>
          {/* Column 2: Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 mr-3" />
                <a href="mailto:support@sustenirhr.com" className="hover:text-white"> support@sustenirhr.com </a>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="w-4 h-4 mr-3" />
                <span>+254 708 497595</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
