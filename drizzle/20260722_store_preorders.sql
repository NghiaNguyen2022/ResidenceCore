-- 16L8.30 — Đặt hàng trước
CREATE TABLE IF NOT EXISTS storePreorders (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ledgerId INT NOT NULL,
  storeShiftId INT NULL,
  orderCode VARCHAR(60) NOT NULL,
  orderDate DATE NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(30) NOT NULL,
  deliveryAddress TEXT NULL,
  fulfillmentType ENUM('pickup','delivery') NOT NULL DEFAULT 'pickup',
  requestedDate DATE NOT NULL,
  depositAmount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  totalAmount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','confirmed','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
  saleDocumentId INT NULL,
  notes TEXT NULL,
  createdByResidentId INT NULL,
  completedAt TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY storePreorders_orderCode_unique (orderCode),
  KEY storePreorders_ledger_status_idx (ledgerId,status),
  KEY storePreorders_requestedDate_idx (requestedDate),
  CONSTRAINT storePreorders_ledger_fk FOREIGN KEY (ledgerId) REFERENCES storeLedgers(id) ON DELETE RESTRICT,
  CONSTRAINT storePreorders_shift_fk FOREIGN KEY (storeShiftId) REFERENCES storeShifts(id) ON DELETE SET NULL,
  CONSTRAINT storePreorders_sale_document_fk FOREIGN KEY (saleDocumentId) REFERENCES storeDocuments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS storePreorderLines (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  preorderId INT NOT NULL,
  productId INT NOT NULL,
  lineNo INT NOT NULL,
  quantity DECIMAL(14,2) NOT NULL,
  unitPrice DECIMAL(14,2) NOT NULL,
  lineAmount DECIMAL(14,2) NOT NULL,
  notes VARCHAR(500) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY storePreorderLines_order_line_unique (preorderId,lineNo),
  KEY storePreorderLines_product_idx (productId),
  CONSTRAINT storePreorderLines_order_fk FOREIGN KEY (preorderId) REFERENCES storePreorders(id) ON DELETE CASCADE,
  CONSTRAINT storePreorderLines_product_fk FOREIGN KEY (productId) REFERENCES storeProducts(id) ON DELETE RESTRICT
);
