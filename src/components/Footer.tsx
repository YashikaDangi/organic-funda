import Link from "next/link";
import { FaInstagram, FaTwitter, FaLeaf } from "react-icons/fa";
import { GiMushroomGills } from "react-icons/gi";

export default function Footer() {
  return (
    <footer className="bg-[#183E2D] text-[#F2EFEA] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo & Tagline */}
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold text-green-100">
            <GiMushroomGills className="" />
            <span className="font-pacifico">OrganicFunda</span>
          </div>
          <p className="text-sm mt-3 text-green-100/70">
            Exploring the world of fungi — edible, medicinal, and magical.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="text-lg font-semibold text-[#C9E265] mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-green-100/80">
            <li>
              <Link href="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/types" className="hover:text-white transition">
                Types of Mushrooms
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social & Newsletter */}
        <div>
          <h4 className="text-lg font-semibold text-[#C9E265] mb-4">Connect</h4>
          <div className="flex space-x-5 mb-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-100 hover:text-pink-400 transition"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-100 hover:text-blue-400 transition"
            >
              <FaTwitter size={20} />
            </a>
          </div>
          <p className="text-sm text-green-100/70">
            Join our newsletter for mushroom tips and updates.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-green-100/20 pt-4 text-center text-xs text-green-100/50">
        &copy; {new Date().getFullYear()} OrganicFunda. All rights reserved.
      </div>
    </footer>
  );
}