class Supplier {
  constructor(name, email, phone, address = '', logoUrl = '') {
    this.id = null; // Will be auto-assigned
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.logoUrl = logoUrl;
    this.dateCreated = new Date().toISOString();
    this.lastUpdated = new Date().toISOString();
  }
}

module.exports = Supplier; // Export the class for use in JSON Server
