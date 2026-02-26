// src/app/legal/terms-and-conditions/page.tsx
import React from 'react';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-deep-navy text-off-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Terms and Conditions</h1>
        <p className="text-lg mb-4">
          Welcome to Veritariff! These terms and conditions outline the rules and regulations for the use of Veritariff's Website, located at veritariff.com.
        </p>
        <p className="text-lg mb-4">
          By accessing this website we assume you accept these terms and conditions. Do not continue to use veritariff.com if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Intellectual Property Rights</h2>
        <p className="mb-4">
          Unless otherwise stated, Veritariff and/or its licensors own the intellectual property rights for all material on veritariff.com. All intellectual property rights are reserved. You may access this from veritariff.com for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>Republish material from veritariff.com</li>
          <li>Sell, rent or sub-license material from veritariff.com</li>
          <li>Reproduce, duplicate or copy material from veritariff.com</li>
          <li>Redistribute content from Veritariff</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Comments</h2>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>This Agreement shall begin on the date hereof.</li>
          <li>Certain parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Veritariff does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of Veritariff,its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, Veritariff shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.</li>
          <li>Veritariff reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Hyperlinking to our Content</h2>
        <p className="mb-4">
          The following organizations may link to our Website without prior written approval:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>Government agencies;</li>
          <li>Search engines;</li>
          <li>News organizations;</li>
          <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
          <li>System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
        </ul>
        <p className="mb-4">
          We may consider and approve other link requests from the following types of organizations:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>commonly-known consumer and/or business information sources;</li>
          <li>dot.com community sites;</li>
          <li>associations or other groups representing charities;</li>
          <li>online directory distributors;</li>
          <li>internet portals;</li>
          <li>accounting, law and consulting firms; and</li>
          <li>educational institutions and trade associations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. iFrames</h2>
        <p className="mb-4">
          Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Content Liability</h2>
        <p className="mb-4">
          We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that are rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Reservation of Rights</h2>
        <p className="mb-4">
          We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Removal of links from our website</h2>
        <p className="mb-4">
          If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.
        </p>
        <p className="mb-4">
          We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Disclaimer</h2>
        <p className="mb-4">
          To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
        </p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>limit or exclude our or your liability for death or personal injury;</li>
          <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
          <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
          <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
        </ul>
        <p className="mb-4">
          The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.
        </p>
        <p className="mb-4">
          As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
