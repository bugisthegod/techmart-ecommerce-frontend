
function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #ddd',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '1.5rem'
        }}>
          {/* Company Info */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>E-Commerce</h4>
            <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Your trusted online shopping destination. 
              Quality products, fast delivery, excellent service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Quick Links</h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '0.875rem'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/products" style={{ color: '#666', textDecoration: 'none' }}>
                  All Products
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/cart" style={{ color: '#666', textDecoration: 'none' }}>
                  Shopping Cart
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/user" style={{ color: '#666', textDecoration: 'none' }}>
                  My Account
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Customer Service</h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '0.875rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#666' }}>
                📞 1-800-SHOP-NOW
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#666' }}>
                ✉️ support@ecommerce.com
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#666' }}>
                🕒 Mon-Fri 9AM-6PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ 
            margin: 0, 
            color: '#666', 
            fontSize: '0.875rem' 
          }}>
            © 2024 E-Commerce Platform. All rights reserved.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a 
              href="#" 
              style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: '0.875rem' 
              }}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              style={{ 
                color: '#666', 
                textDecoration: 'none', 
                fontSize: '0.875rem' 
              }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;