import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'apps/client/src/pages/Home.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Revert Trustpilot badge above hero section (5 stars)
content = content.replace(/className="w-5 h-5 sm:w-6 sm:h-6 bg-\[#FF4500\] flex items-center justify-center rounded-\[3px\]"/g, 'className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00B67A] flex items-center justify-center rounded-[3px]"');

// 2. Revert Customer Reviews header span
content = content.replace(/<h2 className="text-4xl lg:text-5xl font-\[800\] text-\[#5C1A06\] mb-4">Customer <span className="text-\[#FF4500\]">Reviews<\/span><\/h2>/, '<h2 className="text-4xl lg:text-5xl font-[800] text-[#5C1A06] mb-4">Customer <span className="text-[#00B67A]">Reviews</span></h2>');

// 3. Revert the 5 stars above text
content = content.replace(/<div key=\{i\} className="w-8 h-8 bg-\[#FF4500\] flex items-center justify-center">/g, '<div key={i} className="w-8 h-8 bg-[#00B67A] flex items-center justify-center">');

// 4. Revert Trustpilot star icon text
content = content.replace(/<span className="text-\[#FF4500\] text-lg leading-none">★<\/span> Trustpilot/g, '<span className="text-[#00B67A] text-lg leading-none">★</span> Trustpilot');

// 5. Revert full stars in review cards
content = content.replace(/\? "bg-\[#FF4500\]"/g, '? "bg-[#00B67A]"');

// 6. Revert half stars in review cards
content = content.replace(/\? "bg-\[linear-gradient\(to_right,#FF4500_50%,#D1D5DB_50%\)\]"/g, '? "bg-[linear-gradient(to_right,#00B67A_50%,#D1D5DB_50%)]"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully reverted Trustpilot colors to green');
