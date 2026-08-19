import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'apps/client/src/pages/Home.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Backgrounds
  { search: /from-\[#C7D0E6\]/g, replace: 'from-[#FFDFD6]' },
  { search: /to-\[#DDE3F0\]/g, replace: 'to-[#FFEBE5]' },
  { search: /from-\[#E8EBF5\]/g, replace: 'from-[#FFF0EB]' },
  
  // Texts
  { search: /#0E1B4D/g, replace: '#5C1A06' },
  { search: /to-\[#1A2C6B\]/g, replace: 'to-[#8B0000]' },
  
  // Gradients
  { search: /from-\[#0EA5E9\]/g, replace: 'from-[#FF4500]' },
  { search: /to-\[#6366F1\]/g, replace: 'to-[#FF0000]' },
  { search: /from-\[#D9A85C\]/g, replace: 'from-[#FF8C00]' },
  { search: /to-\[#F59E0B\]/g, replace: 'to-[#FF4500]' },
  { search: /from-\[#A99CFF\]/g, replace: 'from-[#FF0000]' },
  
  // Accents
  { search: /#A99CFF/g, replace: '#FF4500' },
  { search: /#6366F1/g, replace: '#FF0000' },
  { search: /#00B67A/g, replace: '#FF4500' }, // Trustpilot green to orange? Let's keep trustpilot green: skip this.
  
  // Content Replacements
  { search: /Trade USDT, USDC, DAI & BNB in seconds./g, replace: 'Trade USDT, USDC, DAI & POL in seconds.' },
  { search: /Swap USDT, USDC, DAI & BNB instantly without hidden fees./g, replace: 'Swap USDT, USDC, DAI & POL instantly without hidden fees.' },
  { search: /BNB Supported/g, replace: 'Polygon (POL) Supported' },
  { search: /Swaps natively built in for fast BNB processing./g, replace: 'Swaps natively built in for fast Polygon processing.' },
  { search: /bg-\[#F3BA2F\] flex items-center justify-center text-\[4px\] lg:text-\[5px\] text-\[#0E1B4D\] font-bold z-20 border border-white shadow-sm">BNB/g, replace: 'bg-[#8247E5] flex items-center justify-center text-[4px] lg:text-[5px] text-white font-bold z-20 border border-white shadow-sm">POL' },
  { search: /bg-\[#F3BA2F\] flex items-center justify-center text-\[5px\] text-\[#0E1B4D\] font-bold z-20 border border-white shadow-sm">BNB/g, replace: 'bg-[#8247E5] flex items-center justify-center text-[5px] text-white font-bold z-20 border border-white shadow-sm">POL' },
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully applied orange/red Polygon theme to Home.jsx');
