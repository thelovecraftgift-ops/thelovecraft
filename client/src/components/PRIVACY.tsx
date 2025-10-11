import React from 'react';

const TheLoveCraftPrivacy = () => {
  return (
    <div className="bg-white p-6 md:p-12 font-sans max-w-4xl mx-auto shadow-lg rounded-lg my-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-pink-600 mb-6">
        Privacy Policy – The Love Craft
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          At The Love Craft, we value your privacy and are committed to protecting your personal
          information. This policy explains how we collect, use, and safeguard your data.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">
          1. Information We Collect
        </h2>
        <p>We may collect:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Personal Information</strong>: Name, email address, phone number, and shipping
            address (during checkout).
          </li>
          <li>
            <strong>Payment Information</strong>: Processed securely through <strong>Razorpay</strong> — we do <strong>not</strong> store any card or UPI data.
          </li>
          <li>
            <strong>Technical Data</strong>: Includes cookies, IP address, and browser/device
            information.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">
          2. How We Use Your Information
        </h2>
        <p>We use your data to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Fulfill and deliver your orders.</li>
          <li>Send order updates or support messages.</li>
          <li>Improve website experience and customer service.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell or share your personal information with third parties for
          marketing.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">3. Data Security</h2>
        <p>Your information is protected using:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>SSL encryption during data transfer.</li>
          <li>Secure, trusted payment processing via Razorpay.</li>
          <li>Restricted access to your data.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">4. Your Consent</h2>
        <p>
          By using our website, you agree to the terms of this Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">
          5. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted here with an
          updated “Effective Date”.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">6. Contact Us</h2>
        <p>For privacy-related concerns, contact us:</p>
        <ul className="list-none space-y-2">
          <li>📧 <a href="mailto:thelovecraft.gift@gmail.com" className="text-pink-600 hover:underline">thelovecraft.gift@gmail.com</a></li>
          <li>📱 +91-8757331432</li>
        </ul>
      </div>
    </div>
  );
};

export default TheLoveCraftPrivacy;
