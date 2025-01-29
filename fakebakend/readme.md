#


```sh
npm run dev  # For development (with auto-reload)
# OR
npm start    # For production



```




## API Endpoints

### **Suppliers**
| Method | Endpoint          | Description                      | File Upload       |
|--------|-------------------|----------------------------------|-------------------|
| POST   | `/suppliers`      | Create a supplier with logo      | `logo` (single)   |
| GET    | `/suppliers`      | Get all suppliers                | -                 |
| PUT    | `/suppliers/{id}` | Update a supplier (with logo)    | `logo` (optional) |

### **Products**
| Method | Endpoint          | Description                              | File Uploads               |
|--------|-------------------|------------------------------------------|----------------------------|
| POST   | `/products`       | Create a product with images             | `mainImage` + `images`     |
| GET    | `/products`       | Get all products                         | -                          |
| PUT    | `/products/{id}`  | Update a product (with images)           | `mainImage` + `images` (optional) |