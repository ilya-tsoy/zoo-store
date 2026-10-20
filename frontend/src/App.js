import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './Lizards.css';
import lizardProducts from './lizardProducts';
import LizardIntro from './LizardIntro';

const productImages = {
  'Dog Food': 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'Cat Toy': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0JTIwdG95fGVufDB8fDB8fHww',
  'Bird Cage': 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmlyZCUyMGNhZ2V8ZW58MHx8MHx8fDA%3D',
  'Parrot Perch': 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFycm90fGVufDB8fDB8fHww',
  'Aquarium Filter': 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXF1YXJpdW18ZW58MHx8MHx8fDA%3D',
  'Hamster Wheel': 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFtc3RlcnxlbnwwfHwwfHx8MA%3D%3D',
  'Reptile Heat Lamp': 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVwdGlsZXxlbnwwfHwwfHx8MA%3D%3D',
  'Rabbit Hutch': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFiYml0fGVufDB8fDB8fHww',
  'Fish Food Flakes': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmlzaHxlbnwwfHwwfHx8MA%3D%3D',
  'Guinea Pig Hay': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3VpbmVhJTIwcGlnfGVufDB8fDB8fHww',
  'Turtle Dock': 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHVydGxlfGVufDB8fDB8fHww',
  'Ferret Hammock': 'https://images.unsplash.com/photo-1612267168669-679c961c5b31?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVycmV0fGVufDB8fDB8fHww',
  'Lizard Climbing Set': 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGl6YXJkfGVufDB8fDB8fHww'
};

function App() {
  const isLizardPage = window.location.pathname.replace(/\/$/, '') === '/lizards';
  const [products, setProducts] = useState(isLizardPage ? lizardProducts : []);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [animalFilters, setAnimalFilters] = useState([]);
  const [productTypeFilters, setProductTypeFilters] = useState([]);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [isAnimalFilterOpen, setIsAnimalFilterOpen] = useState(true);
  const [isProductTypeFilterOpen, setIsProductTypeFilterOpen] = useState(true);

  useEffect(() => {
    if (!isLizardPage) fetchProducts();
  }, [isLizardPage]);

  useEffect(() => {
    const updateFilterOptions = () => {
      const animalTypesSet = new Set(products.map(product => product.animal_type));
      const productTypesSet = new Set(products.map(product => product.product_type));
      setAnimalTypes(Array.from(animalTypesSet));
      setProductTypes(Array.from(productTypesSet));
    };

    const filterProducts = () => {
      let filtered = products;

      if (searchTerm) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (animalFilters.length > 0) {
        filtered = filtered.filter(product => animalFilters.includes(product.animal_type));
      }

      if (productTypeFilters.length > 0) {
        filtered = filtered.filter(product => productTypeFilters.includes(product.product_type));
      }

      setFilteredProducts(filtered);
    };

    filterProducts();
    updateFilterOptions();
  }, [products, searchTerm, animalFilters, productTypeFilters]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      console.log('Fetched products:', response.data); // Debug log
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleAnimalFilterChange = (animalType) => {
    setAnimalFilters(prev => 
      prev.includes(animalType) 
        ? prev.filter(type => type !== animalType)
        : [...prev, animalType]
    );
  };

  const handleProductTypeFilterChange = (productType) => {
    setProductTypeFilters(prev => 
      prev.includes(productType) 
        ? prev.filter(type => type !== productType)
        : [...prev, productType]
    );
  };

  const getImageUrl = (productName) => {
    return productImages[productName] || 'https://via.placeholder.com/300x200.png?text=No+Image';
  };

  const updateCart = (productId, amount) => {
    setCartItems(prevItems => {
      const newAmount = (prevItems[productId] || 0) + amount;
      if (newAmount <= 0) {
        const { [productId]: removed, ...rest } = prevItems;
        return rest;
      }
      return { ...prevItems, [productId]: newAmount };
    });
    setIsCartOpen(true);
  };

  const totalCartItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (cartItems[product.id] || 0) * parseFloat(product.price);
    }, 0);
  };

  return (
    <div className={`App${isLizardPage ? ' lizard-page' : ''}`}>
      <header className="header">
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/lizards" aria-current={isLizardPage ? 'page' : undefined}>Lizard supplies</a></li>
          </ul>
        </nav>
        <button type="button" className="cart-icon" aria-label={`Open cart (${totalCartItems} items)`} onClick={() => setIsCartOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {totalCartItems > 0 && <span className="cart-count">{totalCartItems}</span>}
        </button>
      </header>
      
      {isLizardPage && (
        <div className="lizard-welcome">
          <nav className="lizard-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Lizard supplies</span></nav>
          <LizardIntro />
        </div>
      )}
      <main className="main-content" id={isLizardPage ? 'lizard-products' : undefined}>
        <aside className="filters-sidebar">
          <h2>Filters</h2>
          <input
            type="text"
            aria-label="Search products"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {!isLizardPage && <div className="filter-section">
            <h3 onClick={() => setIsAnimalFilterOpen(!isAnimalFilterOpen)}>
              Animal Type {isAnimalFilterOpen ? '▼' : '▶'}
            </h3>
            {isAnimalFilterOpen && (
              <ul>
                {animalTypes.map(type => (
                  <li key={type}>
                    <label>
                      <input
                        type="checkbox"
                        checked={animalFilters.includes(type)}
                        onChange={() => handleAnimalFilterChange(type)}
                      />
                      {type}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>}
          <div className="filter-section">
            <h3><button type="button" className="filter-toggle" aria-expanded={isProductTypeFilterOpen} onClick={() => setIsProductTypeFilterOpen(!isProductTypeFilterOpen)}>
              Product Type {isProductTypeFilterOpen ? '▼' : '▶'}
            </button></h3>
            {isProductTypeFilterOpen && (
              <ul>
                {productTypes.map(type => (
                  <li key={type}>
                    <label>
                      <input
                        type="checkbox"
                        checked={productTypeFilters.includes(type)}
                        onChange={() => handleProductTypeFilterChange(type)}
                      />
                      {type}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="product-grid">
          {isLizardPage ? (
            <div className="lizard-catalog-heading">
              <div><p className="lizard-eyebrow">Their world, well equipped</p><h2>Lizard supplies</h2></div>
              <span aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span>
            </div>
          ) : <h1>New Arrivals</h1>}
          <div className="product-list">
            {filteredProducts.length === 0 ? (
              <div className="empty-products"><p>{isLizardPage ? 'No supplies match your search. Try another word or clear your filters.' : 'No products available.'}</p>
                {isLizardPage && <button className="lizard-reset" onClick={() => { setSearchTerm(''); setProductTypeFilters([]); }}>Clear filters</button>}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="image-container">
                    <img src={product.image || getImageUrl(product.name)} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    {isLizardPage && <p className="lizard-product-type">{product.product_type}</p>}
                    <h3>{product.name}</h3>
                    {isLizardPage && <><p className="lizard-description">{product.description}</p><p className="lizard-details">{product.details}</p></>}
                    <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                    {cartItems[product.id] ? (
                      <div className="cart-controls">
                        <button aria-label={`Remove one ${product.name}`} onClick={() => updateCart(product.id, -1)} className="quantity-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className="quantity">{cartItems[product.id]}</span>
                        <button aria-label={`Add one ${product.name}`} onClick={() => updateCart(product.id, 1)} className="quantity-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button aria-label={`Add ${product.name} to cart`} onClick={() => updateCart(product.id, 1)} className="add-to-cart-btn">
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      {isLizardPage && <footer className="lizard-footer"><strong>Every lizard has its own way of living.</strong><p>Choose enclosure dimensions, heating, and lighting to suit your species and setup. Check product measurements before you build their world.</p><a href="/products">Explore all pet supplies <span aria-hidden="true">→</span></a></footer>}

      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <h2>Your Cart</h2>
            <button className="close-cart" aria-label="Close cart" onClick={() => setIsCartOpen(false)}>×</button>
            {Object.keys(cartItems).length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {products.filter(product => cartItems[product.id]).map(product => (
                  <div key={product.id} className="cart-item">
                    <span>{product.name}</span>
                    <span>{cartItems[product.id]} × ${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                </div>
                <button className="checkout-btn">Checkout</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;