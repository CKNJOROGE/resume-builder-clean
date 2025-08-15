import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Smartphone, FileText, UserPlus, Layout, Download, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
    description: 'Download your resume as PDF or share a live link instantly.',
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
    desc: 'Download as PDF or send a live online link to recruiters.',
  },
];

const pricing = [
  {
    title: 'Free',
    price: '$0',
    features: ['3 Templates', 'Basic Editing', 'PDF Export'],
    cta: 'Start Free',
  },
  {
    title: 'Pro',
    price: '$9/mo',
    features: ['All Templates', 'Unlimited Edits', 'Live Link', 'Priority Support'],
    cta: 'Upgrade Now',
    popular: true,
  },
];

const faqs = [
  { q: 'Can I change my template later?', a: 'Absolutely! Switch templates anytime without losing your content.' },
  { q: 'What file formats are supported?', a: 'Export as PDF or share a fully responsive online link.' },
  { q: 'Is there a free tier?', a: 'Yes, our free plan includes basic templates and exports.' },
];

export default function Homepage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
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
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white rounded-lg text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-gray-600">Everything you need to craft a standout resume, all in one place.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="text-center p-6 border rounded-lg hover:shadow-lg transition"
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600">Just three simple steps to your perfect resume.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-lg shadow-lg"
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

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Plans & Pricing</h2>
          <p className="text-gray-600">Select a plan that fits your needs.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {pricing.map((p, i) => (
            <motion.div
              key={i}
              className={`p-6 rounded-lg border ${p.popular ? 'border-blue-600 shadow-lg' : 'border-gray-200'}`}
              whileHover={{ scale: 1.02 }}
            >
              {p.popular && <div className="text-sm text-white bg-blue-600 inline-block px-2 py-1 rounded-full mb-2">Most Popular</div>}
              <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
              <p className="text-4xl font-extrabold mb-4">{p.price}</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                {p.features.map((f, j) => (<li key={j}>• {f}</li>))}
              </ul>
              <Link
                to={p.title === 'Free' ? '/signup' : '/paywall'}
                className={`block text-center px-4 py-2 rounded-lg font-semibold ${p.popular ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-600 hover:bg-blue-50'} transition`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
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
          to="/signup"
          className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">© {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/templates" className="hover:text-white">Templates</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
