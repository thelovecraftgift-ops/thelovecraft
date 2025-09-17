import React from 'react';

const TheLoveCraftContact = () => {
  return (
    <div className="bg-white p-6 md:p-12 font-sans max-w-4xl mx-auto shadow-lg rounded-lg my-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-pink-600 mb-4">
        Contact Us
      </h1>
      <p className="text-gray-600 text-lg mb-8">
        We'd love to hear from you! Here's how you can get in touch or visit us.
      </p>

      <div className="flex flex-col items-center space-y-8">
        {/* Email & Phone */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <span className="text-pink-500 text-2xl mr-3">📧</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Email Us</h3>
              <p className="text-gray-600">thelovecraft.gift@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-pink-500 text-2xl mr-3">📱</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Call Us</h3>
              <p className="text-gray-600">+91 8757331432</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-pink-50 p-6 rounded-lg shadow-inner w-full max-w-md">
          <div className="flex items-center justify-center mb-2">
            <span className="text-pink-500 text-2xl mr-3">📍</span>
            <h3 className="text-xl font-semibold text-gray-800">Visit Us</h3>
          </div>
          <p className="text-gray-600 font-medium">NH 33, Dimna Pardih Road</p>
          <p className="text-gray-600">Opposite SBI Bank</p>
          <p className="text-gray-600">Jamshedpur, Jharkhand - 831012</p>
        </div>
      </div>
    </div>
  );
};

export default TheLoveCraftContact;