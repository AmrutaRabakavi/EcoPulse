import React from 'react';
import { Leaf, ShieldCheck, Cpu, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-slate-700">EcoPulse / Green Campus Platform</span>
          <span className="text-slate-400">| College Sustainability Initiative</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>IoT Ready</span>
          </div>
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Green Deeds</span>
          </div>
          <div className="flex items-center space-x-1">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Campus Production Ready</span>
          </div>
        </div>

        <div>
          <span>© {new Date().getFullYear()} EcoPulse. Built for Clean, Smart Campuses.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
