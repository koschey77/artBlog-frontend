import React from 'react'
import Header from '../partials/Header'
import Footer from '../partials/Footer'
function Contact() {
  return (
    <>
      <Header />
      <section className="mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-9 mx-auto text-center">
              <h1 className="fw-bold">Get in Touch</h1>
              <p className="lead">Connect with us about art, culture, and creative collaborations</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-4">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 mx-auto">
              <iframe
                className="w-100 h-300 grayscale"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.976776386911!2d30.509707215677!3d50.441677679469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cef8947cef01%3A0x696f3f33862b410!2sZhylianska%20St%2C%20128%2F28%2C%20Kyiv%2C%2002000!5e0!3m2!1sen!2sua!4v1732800000000!5m2!1sen!2sua"
                height={500}
                style={{border: 0}}
                aria-hidden="false"
                tabIndex={0}
              />
              <div className="row mt-5">
                <div className="col-sm-6 mb-5 mb-sm-0">
                  <h3>Gallery & Office Location</h3>
                  <address>128/28 Zhylianska Street, Kyiv, 01033, Ukraine</address>
                  <p>
                    Phone:{' '}
                    <a href="tel:+380441111234" className="text-reset">
                      <u>+380 (44) 111-12-34</u>
                    </a>
                  </p>
                  <p>
                    Email:{' '}
                    <a href="mailto:info@artblog.com" className="text-reset">
                      <u>info@artblog.com</u>
                    </a>
                  </p>
                  <p>
                    Gallery Hours:
                    <br />
                    Tuesday - Sunday: 11:00 AM - 7:00 PM
                    <br />
                    Monday: Closed
                  </p>
                </div>
                <div className="col-sm-6">
                  <h3>Editorial & Press Inquiries</h3>
                  <p>Reach out to our editorial team for collaborations, interviews, and press materials</p>
                  <p>
                    Press Contact:{' '}
                    <a href="tel:+380441111235" className="text-reset">
                      <u>+380 (44) 111-12-35</u>
                    </a>
                  </p>
                  <p>
                    Email:{' '}
                    <a href="mailto:press@artblog.com" className="text-reset">
                      <u>press@artblog.com</u>
                    </a>
                  </p>
                  <p>
                    Available:
                    <br />
                    Monday - Friday: 10:00 AM - 6:00 PM
                  </p>
                  <p className="mt-3">
                    <strong>Follow us:</strong>
                    <br />
                    Stay updated on the latest exhibitions, events, and art news
                  </p>
                </div>
              </div>
              <hr className="my-5" />
              <div className="row mb-5">
                <div className="col-12">
                  <h2 className="fw-bold">Send us a Message</h2>
                  <p>
                    Whether you're an artist, collector, or art enthusiast, we'd love to hear from you. Share your thoughts, ideas, or inquiries
                    below.
                  </p>
                  {/* Form START */}
                  <form className="contact-form" id="contact-form" name="contactform" method="POST">
                    {/* Main form */}
                    <div className="row">
                      <div className="col-md-6">
                        {/* name */}
                        <div className="mb-3">
                          <input required="" id="con-name" name="name" type="text" className="form-control" placeholder="Your Name" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        {/* email */}
                        <div className="mb-3">
                          <input required="" id="con-email" name="email" type="email" className="form-control" placeholder="Your Email" />
                        </div>
                      </div>
                      <div className="col-md-12">
                        {/* Subject */}
                        <div className="mb-3">
                          <input required="" id="con-subject" name="subject" type="text" className="form-control" placeholder="Subject" />
                        </div>
                      </div>
                      <div className="col-md-12">
                        {/* Message */}
                        <div className="mb-3">
                          <textarea
                            required=""
                            id="con-message"
                            name="message"
                            cols={40}
                            rows={6}
                            className="form-control"
                            placeholder="Your Message"
                            defaultValue={''}
                          />
                        </div>
                      </div>
                      {/* submit button */}
                      <div className="col-md-12 text-start">
                        <button className="btn btn-primary w-100" type="submit">
                          Send Message <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                  {/* Form END */}
                </div>
              </div>
            </div>{' '}
            {/* Col END */}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default Contact
