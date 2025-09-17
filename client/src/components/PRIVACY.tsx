import React from 'react';

const TheLoveCraftPrivacy = () => {
  return (
    <div className="bg-white p-6 md:p-12 font-sans max-w-4xl mx-auto shadow-lg rounded-lg my-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-pink-600 mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          At The Love Craft, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our website or make a purchase.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">1. Information We Collect</h2>
        <p>
          We collect personal information that you provide to us directly, such as your name, email address, shipping address, and phone number, when you place an order. We do not store your payment information.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Process and fulfill your orders.</li>
          <li>Communicate with you about your order status.</li>
          <li>Provide customer support.</li>
          <li>Improve our website and product offerings.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">3. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share your information with trusted third parties who assist us in operating our business (e.g., shipping partners), but only to the extent necessary to provide the service.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">4. Data Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information. We use secure servers and encryption to protect your data during transmission.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">5. Your Consent</h2>
        <p>
          By using our site, you consent to our privacy policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">6. Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
      </div>
    </div>
  );
};

export default TheLoveCraftPrivacy;