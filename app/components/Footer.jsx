import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTiktok, FaTwitter, FaWhatsapp } from 'react-icons/fa'; // Anda perlu menginstal react-icons

export default function Footer() {
  return (
    <footer className="bg-sky-600 text-white py-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="mb-6 md:mb-0">
          <Link href="/" className="text-3xl font-bold hover:text-aqua-accent transition duration-300">
            OCEANTIC
          </Link>
          <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} OCEANTIC. All rights reserved.</p>
        </div>
        <div className="flex space-x-6">
          <a href="https://www.facebook.com/people/Oceantic-Official/61578010997154/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-aqua-accent transition duration-300 text-2xl">
            <FaFacebookF />
          </a>
          <a href="https://www.instagram.com/oceantic_official" target="_blank" rel="noopener noreferrer" className="text-white hover:text-aqua-accent transition duration-300 text-2xl">
            <FaInstagram />
          </a>

          <a href="https://api.whatsapp.com/send/?phone=62895365089206&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-white hover:text-aqua-accent transition duration-300 text-2xl">
            <FaWhatsapp />
          </a>
          <a href="https://www.tiktok.com/@oceanticsports" target="_blank" rel="noopener noreferrer" className="text-white hover:text-aqua-accent transition duration-300 text-2xl">
            <FaTiktok />
          </a>


        </div>
      </div>
    </footer>
  );
}
