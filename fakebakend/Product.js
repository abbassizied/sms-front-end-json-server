class Product {
  constructor(name, supplierId, mainImageUrl = '', imagesUrls = []) {
    this.id = null; // Will be auto-assigned
    this.name = name;
    this.supplierId = supplierId;
    this.mainImageUrl = mainImageUrl;
    this.imagesUrls = imagesUrls;
    this.dateCreated = new Date().toISOString();
    this.lastUpdated = new Date().toISOString();
  }
}

module.exports = Product;
