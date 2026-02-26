// src/app/legal/privacy-policy/page.tsx
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-deep-navy text-off-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-lg mb-4">
          This Privacy Policy describes how Veritariff collects, uses, and discloses your personal information when you visit or make a purchase from veritariff.com (the "Site").
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect various types of information in connection with the services we provide, including:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li><strong>Personal Information:</strong> Name, email address, company, job title, and contact details when you register for an account, subscribe to our newsletter, or contact us.</li>
          <li><strong>Usage Data:</strong> Information about how you access and use the Site, such as your IP address, browser type, operating system, referring URLs, pages viewed, and the dates/times of your visits.</li>
          <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Site and hold certain information.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect for various purposes, including to:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>Provide, operate, and maintain our Site and services.</li>
          <li>Improve, personalize, and expand our Site and services.</li>
          <li>Understand and analyze how you use our Site.</li>
          <li>Develop new products, services, features, and functionality.</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Site, and for marketing and promotional purposes.</li>
          <li>Process your transactions and manage your orders.</li>
          <li>Find and prevent fraud.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Sharing Your Information</h2>
        <p className="mb-4">
          We may share your personal information in the following situations:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work.</li>
          <li><strong>For Business Transfers:</strong> We may share or transfer your personal information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
          <li><strong>With Affiliates:</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</li>
          <li><strong>For Legal Reasons:</strong> We may disclose your information where required to do so by law or subpoena or if we believe that such action is necessary to comply with the law and the reasonable requests of law enforcement or to protect the security or integrity of our Service.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Your Data Protection Rights</h2>
        <p className="mb-4">
          Depending on your location, you may have the following data protection rights:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>The right to access, update or to delete the information we have on you.</li>
          <li>The right of rectification.</li>
          <li>The right to object.</li>
          <li>The right of restriction.</li>
          <li>The right to data portability.</li>
          <li>The right to withdraw consent.</li>
        </ul>
        <p className="mb-4">
          To exercise any of these rights, please contact us at [Your Contact Email].
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Security of Your Information</h2>
        <p className="mb-4">
          The security of your personal information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>By email: [Your Contact Email]</li>
          <li>By visiting this page on our website: [Your Contact Page URL]</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
