import React from 'react';

const TheLoveCraftTerms = () => {
  return (
    <div className="bg-white p-6 md:p-12 font-sans max-w-4xl mx-auto shadow-lg rounded-lg my-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-pink-600 mb-6">
        Terms & Conditions – The Love Craft
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Welcome to The Love Craft, your destination for elegant jewellery and thoughtful gifts. 
          By using our website or placing an order, you agree to the following terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">1. General</h2>
        <p>
          The Love Craft is an online brand offering jewellery, gift hampers, and customized products. 
          Please read our terms carefully before ordering.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">2. Products & Custom Orders</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>All items are subject to availability.</li>
          <li>For personalized or customized products, please confirm details with our team before purchase.</li>
          <li>
            For customization requests, contact us at 
            <span className="text-pink-600 font-semibold"> 📧 thelovecraft.gift@gmail.com</span> or 
            <span className="text-pink-600 font-semibold"> 📱 +91-8757331432</span>.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">3. Pricing</h2>
        <p>
          All prices are in INR and include applicable taxes. Shipping charges (if any) will be shown at checkout.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">4. Shipping & Delivery</h2>
        <p>
          We usually dispatch orders within 1–2 working days through trusted courier partners. 
          Delivery time depends on your location.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">5. Cancellations</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Once dispatched, orders cannot be cancelled.</li>
          <li>Customized or personalized items cannot be cancelled after confirmation.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">6. Refund & Return</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>We follow a No Refund & No Return policy.</li>
          <li>
            If you receive a damaged or incorrect product, please share an unboxing video and clear photos 
            within 24 hours of delivery.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">7. Payments</h2>
        <p>
          Payments are processed securely via Razorpay (UPI, Cards, Net Banking, Wallets, etc.).
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">8. Intellectual Property</h2>
        <p>
          All content, images, and designs belong to The Love Craft. Any unauthorized use or reproduction is strictly prohibited.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">9. Contact</h2>
        <p className="text-pink-600 font-semibold">
          📧 thelovecraft.gift@gmail.com
          <br />
          📱 +91-8757331432
        </p>
      </div>
    </div>
  );
};

export default TheLoveCraftTerms;