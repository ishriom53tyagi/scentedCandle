
import React from "react"
import { Footer } from '@components/common'

const Contact = () => {

  return (
    <div>

    <article>

      <div className="max-w-2xl mx-8 sm:mx-auto py-20 flex flex-col items-center justify-center fit">
        <div
          className="uk-container uk-container-xsmall">
          <div><p>The Design Kiln</p>
          <p>239 Shastri Nagar </p>
          <p>Jammu, India, 180004</p>
          <p><a href="tel:+919419119914">Make a call</a> or <a href="mailto:contact@gruhamstudio.com">Send an email</a></p>
          <p>Follow us on <a href="https://www.facebook.com/adgjammu">Facebook</a></p></div>

          <hr className="uk-divider-small" />
        </div>
        <div

          className="uk-container uk-container-xsmall"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11294.120288411797!2d74.85379686407764!3d32.69237248234279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391e85e02bc5ff53%3A0xac8be28bf9572b75!2sThe%20Design%20Kiln!5e0!3m2!1sen!2sin!4v1622038786770!5m2!1sen!2sin"
            width={600}
            height={450}
            style={{ border: "0" }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
        !
      </div>

    </article>
    <Footer/>  
  </div>
  
  )
}

export default Contact