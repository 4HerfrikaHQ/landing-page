import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import {
  FaEnvelope,
  FaInstagram,
  FaLinkedin,
  FaLinkedinIn,
  FaLocationPin,
  FaXTwitter,
} from "react-icons/fa6";

const Contact = () => {
  return (
    <section>
      <section>
        <h1>Get in touch</h1>

        <div>
          <form action=''>
            <h3>Leave us a message</h3>
            <input type='text' />
            <input type='email' name='' id=' ' />
            <textarea name='' id=''></textarea>
            <button type='submit'></button>
          </form>
          <div>
            <p>
              <FaLocationPin /> <span>Africa</span>
            </p>
            <p>
              <FaPhoneAlt /> <span>09082009908</span>
            </p>
            <p>
              <FaEnvelope /> <span>4Herfrikaa@gmail.com</span>
            </p>
            <ul>
              <li>
                <FaInstagram />
              </li>
              <li>
                <FaXTwitter />
              </li>
              <li>
                <FaLinkedinIn />
              </li>
            </ul>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Contact;
