"use client";

import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const phoneNumber = "7031785903"; // Replace with your WhatsApp number (with country code)

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-0 transform -translate-y-1/2 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition"
      title="Chat with us on WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
};

export default WhatsAppButton;
