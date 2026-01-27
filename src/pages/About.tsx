import { Link } from 'react-router-dom';
import { Award, Users, Target, Factory, Shield, Zap, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';

export default function About() {
  return (
    <Layout>
      <Breadcrumb items={[{ label: 'About' }]} />

      {/* Hero Section */}
      <section className="bg-hero-bg text-hero-fg">
        <div className="industrial-container py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              About Nyloking & Co
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
              Leading the industry in high-performance engineering plastics and composite materials. 
              Delivering innovative solutions for the most demanding industrial applications worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="industrial-section bg-background">
        <div className="industrial-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
              <p>
                Established in the year 1992, we, 'Nyloking & Co', are a recognized retailers  and wholesalers of all kinds of Engineering Plastic products and its products.
                Founded with a vision to revolutionize the engineering plastics industry, Nyloking & Co has been 
                at the forefront of innovation for decades. We specialize in providing high-performance thermoplastics 
                and composite materials that meet the most stringent requirements across diverse industries.
              </p>
              <p>
                Our commitment to excellence, combined with deep technical expertise, has made us a trusted partner 
                for engineers, designers, and manufacturers worldwide. From aerospace components to medical devices, 
                from semiconductor equipment to automotive applications, we deliver materials that push the boundaries 
                of what's possible.
              </p>
              <p>
                At Nyloking & Co, we understand that every application is unique. That's why We check our range of Engineering 
                plastics and its products on various quality parameters in order to ensure flawless delivery of products.
                This range find application in various industries like Engineering, Chemical, Electrical, Electronics, Aeronautical  etc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="industrial-section bg-secondary">
        <div className="industrial-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="industrial-card">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide world-class engineering plastics and composite materials that enable our customers 
                to innovate, excel, and achieve their most ambitious engineering goals. We are committed to 
                quality, reliability, and exceptional customer service in everything we do.
              </p>
            </div>
            <div className="industrial-card">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To be the global leader in engineering plastics solutions, recognized for innovation, technical 
                excellence, and unwavering commitment to customer success. We envision a future where advanced 
                materials enable breakthrough technologies across all industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values and 'Why Choose' sections removed per your preference */}

      {/* Industries We Serve */}
      <section className="industrial-section bg-background">
        <div className="industrial-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industries We Serve</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our materials power innovation across diverse sectors, from aerospace to medical, 
              semiconductor to automotive, and beyond.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Aerospace', 'Medical', 'Semiconductor', 'Automotive', 
              'Oil & Gas', 'Electronics', 'Food & Beverage', 'Chemical',
              'Renewable Energy', 'Biopharma', 'Mechanical', 'Building'
            ].map((industry) => (
              <div key={industry} className="p-4 border border-border hover:border-primary/30 bg-background hover:bg-accent/50 transition-colors text-center">
                <span className="text-sm font-medium">{industry}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/industries">Explore All Industries</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Certifications & Compliance */}
      <section className="industrial-section bg-secondary">
        <div className="industrial-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Certifications & Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="industrial-card">
                <h3 className="font-semibold mb-3">Quality Standards</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ISO 9001:2015 Certified</li>
                  <li>• AS9100 Aerospace Quality Management</li>
                  <li>• ISO 13485 Medical Device Quality</li>
                  <li>• IATF 16949 Automotive Quality</li>
                </ul>
              </div>
              <div className="industrial-card">
                <h3 className="font-semibold mb-3">Regulatory Compliance</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• FDA Approved Materials</li>
                  <li>• EU 10/2011 Food Contact Compliant</li>
                  <li>• RoHS & REACH Compliant</li>
                  <li>• USP Class VI Materials Available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="industrial-section bg-background">
        <div className="industrial-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="industrial-card">
                <h3 className="font-semibold mb-3">Business Details</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Director Proprietor:</strong> NYLOKING & CO (Partner)</p>
                  <p><strong className="text-foreground">GSTIN:</strong> 29AABFN2443F1ZH</p>
                  <p><strong className="text-foreground">Business Address:</strong><br />
                  No. 161/1, S.P. Road<br />
                  Bengaluru-560002<br />
                  Karnataka, India</p>
                </div>
              </div>
              <div className="industrial-card">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Phone:</strong> <a href="tel:9448354795" className="hover:text-primary">9448354795</a></p>
                  <p><strong className="text-foreground">Tel:</strong> <a href="tel:222234795" className="hover:text-primary">222234795</a> / <a href="tel:22224200" className="hover:text-primary">22224200</a></p>
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:nylokingandco@gmail.com" className="hover:text-primary">nylokingandco@gmail.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="industrial-container text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Partner With Us
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Ready to find the perfect material solution for your application? 
            Contact our team today for expert consultation and personalized service.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/quote-cart">Request Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
