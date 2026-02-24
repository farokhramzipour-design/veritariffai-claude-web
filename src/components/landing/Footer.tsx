export default function Footer() {
  return (
    <footer className="py-16 border-t border-border-subtle">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold">Brand</h3>
          {/* Social links */}
        </div>
        <div>
          <h3 className="font-bold">Product</h3>
          <ul>
            <li>Features</li>
            <li>Pricing</li>
            <li>Changelog</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Company</h3>
          <ul>
            <li>About</li>
            <li>Blog</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Compliance</h3>
          <p className="text-sm text-text-secondary">Data sourced from TARIC and HMRC official databases.</p>
        </div>
      </div>
    </footer>
  );
}
