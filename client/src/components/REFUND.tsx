import React from 'react';

const TheLoveCraftPolicy = () => {
  return (
    <div className="bg-white p-6 md:p-12 font-sans max-w-4xl mx-auto shadow-lg rounded-lg my-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-pink-600 mb-6">
        Refund & Return Policy – The Love Craft
      </h1>
      <p className="text-gray-700 text-center mb-8">
        At The Love Craft, we value your trust. Please read our policy carefully before placing an order.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Order Cancellation</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Once an order is placed, it cannot be cancelled.</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Returns & Refunds</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>All products are non-returnable and non-refundable.</li>
          <li>Cash refunds are not available.</li>
          <li>Cash on Delivery (COD) is not available. Only prepaid orders are accepted.</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Damaged Products</h2>
        <p className="text-gray-600 mb-3">
          We take utmost care in packaging, but if you receive a damaged product, you can claim it under the following conditions:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>A clear unboxing video (unedited) is mandatory to raise a claim.</li>
          <li>The claim must be reported within 24 hours of delivery.</li>
          <li>Original packaging and invoice should be kept safely.</li>
          <li>If the claim is valid, we will provide a replacement or a refund to the original payment source within 24 hours.</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Disclaimer</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Claims without an unboxing video or raised after 24 hours will not be accepted.</li>
          <li>Normal wear & tear or damage due to mishandling is not covered.</li>
        </ul>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Contact Us</h2>
        <p className="text-gray-600">For support or claims, reach out at:</p>
        <p className="text-pink-600 mt-2">
          <span className="font-semibold">📧 thelovecraft.gift@gmail.com</span>
        </p>
        <p className="text-pink-600 mt-1">
          <span className="font-semibold">📱 +91-8757331432</span>
        </p>
      </div>
    </div>
  );
};

export default TheLoveCraftPolicy;