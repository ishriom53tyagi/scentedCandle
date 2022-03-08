import React from "react"
import { Footer } from '@components/common'

const Contact = () => {

  return (
    <>
      <main className="contact">
        <section className="hero">
          <div className="contact__container">
            <h1>Contact us</h1>
            <div className="row">
                <div className="contact__card">
                  <img src="https://web-assets.zendesk.com/images/p-contact-us/avatar1.svg" alt="" />
                  <h3 className="katamari-field center">Talk to a member of our Sales team</h3>
                  <p className="katamari-field center">We’ll help you find the right products and pricing for your business.</p>
                  <a href="#">Contact Sales</a>          
                </div>
                <div className="contact__card">
                  <img src="https://web-assets.zendesk.com/images/p-contact-us/avatar2.svg" alt="" />
                  <h3 className="katamari-field center">Product and account support</h3>
                  <p className=" katamari-field center">Our help center is fresh and always open for business. If you can’t find the answer you’re looking for, we’re here to lend a hand.</p>
                  <a href="https://support.zendesk.com/hc/en-us/">Go to the help center</a>
                </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>

  )
}

export default Contact