// pure-node-client.js
// A simple Node.js program to demonstrate CRUD operations
// Uses only built-in Node.js modules (no Express, no external packages)

const http = require('http');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 3000;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        // Send data if provided
        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// ========== CRUD OPERATIONS ==========

// 1. CREATE - Add a new product
async function createProduct() {
    console.log('\n📦 CREATE: Adding a new product...\n');
    
    const newProduct = {
        name: 'Classic Leather Jacket',
        category: 'outer wear',
        price: 299.99
    };
    
    try {
        const response = await makeRequest('POST', '/api/products', newProduct);
        
        if (response.statusCode === 201) {
            console.log('✅ Product created successfully!');
            console.log('Product ID:', response.data.data._id);
            console.log('Name:', response.data.data.name);
            console.log('Price: $' + response.data.data.price);
            return response.data.data._id; // Return ID for later operations
        } else {
            console.log('❌ Failed to create product');
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 2. READ - Get all products
async function getAllProducts() {
    console.log('\n📋 READ: Getting all products...\n');
    
    try {
        const response = await makeRequest('GET', '/api/products');
        
        if (response.statusCode === 200) {
            console.log(`✅ Found ${response.data.count} products:\n`);
            
            response.data.data.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Price: $${product.price}`);
                console.log(`   ID: ${product._id}\n`);
            });
            
            return response.data.data;
        } else {
            console.log('❌ Failed to get products');
            return [];
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// 3. READ - Get single product by ID
async function getProductById(productId) {
    console.log(`\n🔍 READ: Getting product ${productId}...\n`);
    
    try {
        const response = await makeRequest('GET', `/api/products/${productId}`);
        
        if (response.statusCode === 200) {
            const product = response.data.data;
            console.log('✅ Found product:');
            console.log(`   Name: ${product.name}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: $${product.price}`);
            return product;
        } else {
            console.log('❌ Product not found');
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 4. UPDATE - Update a product
async function updateProduct(productId) {
    console.log(`\n✏️  UPDATE: Updating product ${productId}...\n`);
    
    const updatedData = {
        name: 'Classic Leather Jacket - SALE',
        category: 'outer wear',
        price: 199.99  // Reduced price
    };
    
    try {
        const response = await makeRequest('PUT', `/api/products/${productId}`, updatedData);
        
        if (response.statusCode === 200) {
            console.log('✅ Product updated successfully!');
            console.log('New name:', response.data.data.name);
            console.log('New price: $' + response.data.data.price);
            return response.data.data;
        } else {
            console.log('❌ Failed to update product');
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 5. DELETE - Delete a product
async function deleteProduct(productId) {
    console.log(`\n🗑️  DELETE: Deleting product ${productId}...\n`);
    
    try {
        const response = await makeRequest('DELETE', `/api/products/${productId}`);
        
        if (response.statusCode === 200) {
            console.log('✅ Product deleted successfully!');
            console.log('Message:', response.data.message);
            return true;
        } else {
            console.log('❌ Failed to delete product');
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Additional operation: Search by category
async function searchByCategory(category) {
    console.log(`\n🔎 SEARCH: Finding all ${category} products...\n`);
    
    try {
        // Encode the category for URL (handles spaces)
        const encodedCategory = encodeURIComponent(category);
        const response = await makeRequest('GET', `/api/products/search/${encodedCategory}`);
        
        if (response.statusCode === 200) {
            console.log(`✅ Found ${response.data.count} products in ${category}:\n`);
            
            response.data.data.forEach((product) => {
                console.log(`- ${product.name}: $${product.price}`);
            });
            
            return response.data.data;
        } else {
            console.log('❌ Search failed');
            return [];
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// ========== MAIN DEMO FUNCTION ==========
async function runDemo() {
    console.log('====================================');
    console.log('🛍️  Men\'s Clothing API Demo');
    console.log('====================================');
    console.log('Using pure Node.js (no Express)');
    console.log(`Connecting to: http://${API_HOST}:${API_PORT}`);
    
    // Add a delay between operations for clarity
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        // Step 1: CREATE a new product
        const newProductId = await createProduct();
        await delay(2000);
        
        // Step 2: READ all products
        await getAllProducts();
        await delay(2000);
        
        // Step 3: READ the specific product we created
        if (newProductId) {
            await getProductById(newProductId);
            await delay(2000);
            
            // Step 4: UPDATE the product
            await updateProduct(newProductId);
            await delay(2000);
            
            // Step 5: Search by category
            await searchByCategory('outer wear');
            await delay(2000);
            
            // Step 6: DELETE the product
            await deleteProduct(newProductId);
            await delay(2000);
            
            // Step 7: Verify deletion
            console.log('\n🔍 Verifying deletion...');
            await getProductById(newProductId);
        }
        
        console.log('\n====================================');
        console.log('✨ Demo completed!');
        console.log('====================================\n');
        
    } catch (error) {
        console.error('Demo failed:', error.message);
    }
}

// ========== INDIVIDUAL OPERATION EXAMPLES ==========

// Example 1: Just get all products
async function exampleGetProducts() {
    console.log('\n--- Example: Get All Products ---\n');
    await getAllProducts();
}

// Example 2: Create and immediately update
async function exampleCreateAndUpdate() {
    console.log('\n--- Example: Create and Update ---\n');
    
    const productId = await createProduct();
    if (productId) {
        await updateProduct(productId);
    }
}

// Example 3: Search specific category
async function exampleSearch() {
    console.log('\n--- Example: Search Category ---\n');
    await searchByCategory('sports ware');
}

// ========== RUN THE PROGRAM ==========

// Check command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    // No arguments - run full demo
    runDemo();
} else {
    // Run specific example based on argument
    switch(args[0]) {
        case 'get':
            exampleGetProducts();
            break;
        case 'create':
            exampleCreateAndUpdate();
            break;
        case 'search':
            exampleSearch();
            break;
        default:
            console.log('Usage: node pure-node-client.js [get|create|search]');
            console.log('No argument runs the full demo');
    }
}

// ========== ERROR HANDLING ==========

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
