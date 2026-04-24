// Fetch and display products
async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
  
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
  
    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input value="${product.name}" data-id="${product._id}" data-field="name"></td>
        <td><input value="${product.description}" data-id="${product._id}" data-field="description"></td>
        <td><input type="number" value="${product.price}" data-id="${product._id}" data-field="price"></td>
        <td><input value="${product.image}" data-id="${product._id}" data-field="image"></td>
        <td>
          <button onclick="updateProduct('${product._id}')">Update</button>
          <button onclick="deleteProduct('${product._id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // Add product
  document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const newProduct = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      image: document.getElementById("image").value
    };
  
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
  
    if (res.ok) {
      loadProducts();
      e.target.reset();
    }
  });
  
  // Update product
  async function updateProduct(id) {
    const inputs = document.querySelectorAll(`[data-id="${id}"]`);
    const updated = {};
  
    inputs.forEach(input => {
      updated[input.dataset.field] = input.value;
    });
  
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  
    loadProducts();
  }
  
  // Delete product
  async function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      loadProducts();
    }
  }
  
  // Initial load
  loadProducts();
  