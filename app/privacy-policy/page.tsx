export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              When you use our authentication services (Google OAuth, LinkedIn OAuth, or email/password), 
              we collect the following information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Profile picture (if provided by OAuth provider)</li>
              <li>Account information from OAuth providers (Google/LinkedIn)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Authenticate and manage your account</li>
              <li>Provide access to our services</li>
              <li>Communicate with you about your account</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. OAuth Authentication</h2>
            <p className="text-gray-700 mb-4">
              When you sign in using Google or LinkedIn OAuth:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>We receive basic profile information from the OAuth provider</li>
              <li>We store your email and name in our secure database</li>
              <li>We do not store your OAuth provider password</li>
              <li>You can revoke access at any time through your OAuth provider settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 mb-4">
              We store your information securely using:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Encrypted database connections</li>
              <li>Hashed passwords (for email/password authentication)</li>
              <li>Secure session management</li>
              <li>Industry-standard security practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Access your personal information</li>
              <li>Request correction of your information</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> privacy@yourdomain.com<br />
              <strong>Website:</strong> <a href="/contact" className="text-blue-600 hover:underline">Contact Page</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

