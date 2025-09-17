import React from 'react';

const TheLoveCraftTerms = () => {
  return (
    <div className="bg-white p-6 md:p-12 font-sans max-w-4xl mx-auto shadow-lg rounded-lg my-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-pink-600 mb-6">Terms & Conditions</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Welcome to The Love Craft. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">1. Intellectual Property</h2>
        <p>
          All content on this site, including text, graphics, logos, images, and product designs, is the property of The Love Craft and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our express written permission.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">2. Use of Our Service</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You must be at least 18 years old to place an order.</li>
          <li>You agree to provide accurate and complete information for all orders.</li>
          <li>We reserve the right to refuse or cancel any order for any reason at our discretion.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">3. Product Information</h2>
        <p>
          We make every effort to display the colors and details of our products as accurately as possible. However, we cannot guarantee that your device's display will accurately reflect the product's appearance. All products are subject to availability.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">4. Disclaimers</h2>
        <p>
          The products and services on this site are provided "as is" without any warranties. The Love Craft disclaims all warranties, express or implied, including but not limited to, implied warranties of merchantability and fitness for a particular purpose.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">5. Limitation of Liability</h2>
        <p>
          The Love Craft shall not be liable for any damages, including but not limited to, direct, indirect, incidental, or consequential damages arising from the use or inability to use our products or services.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">6. Changes to Terms</h2>
        <p>
          We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the site after any changes constitutes your acceptance of the new terms.
        </p>
      </div>
    </div>
  );
};

export default TheLoveCraftTerms;