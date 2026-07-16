CREATE TABLE IF NOT EXISTS storeDocuments (
  id INT NOT NULL AUTO_INCREMENT,
  ledgerId INT NOT NULL,
  ledgerTransactionId INT NULL,
  documentCode VARCHAR(50) NOT NULL,
  documentType ENUM('stock_in','sale') NOT NULL,
  documentDate DATE NOT NULL,
  stockInSource ENUM('purchase','production','self_supply','other') NULL,
  partnerName VARCHAR(255) NULL,
  paymentMethod VARCHAR(50) NULL DEFAULT 'cash',
  totalQuantity DECIMAL(14,2) NOT NULL DEFAULT 0,
  totalAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  status ENUM('posted','cancelled') NOT NULL DEFAULT 'posted',
  createdBy INT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY storeDocuments_documentCode_unique (documentCode),
  KEY storeDocuments_ledger_idx (ledgerId),
  KEY storeDocuments_type_date_idx (documentType, documentDate),
  KEY storeDocuments_transaction_idx (ledgerTransactionId),
  CONSTRAINT storeDocuments_ledger_fk FOREIGN KEY (ledgerId) REFERENCES storeLedgers(id),
  CONSTRAINT storeDocuments_transaction_fk FOREIGN KEY (ledgerTransactionId) REFERENCES storeLedgerTransactions(id) ON DELETE SET NULL,
  CONSTRAINT storeDocuments_created_by_fk FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS storeDocumentLines (
  id INT NOT NULL AUTO_INCREMENT,
  documentId INT NOT NULL,
  productId INT NOT NULL,
  lineNo INT NOT NULL,
  quantity DECIMAL(14,2) NOT NULL,
  unitCost DECIMAL(14,2) NOT NULL DEFAULT 0,
  unitPrice DECIMAL(14,2) NOT NULL DEFAULT 0,
  lineAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY storeDocumentLines_document_line_unique (documentId, lineNo),
  KEY storeDocumentLines_document_idx (documentId),
  KEY storeDocumentLines_product_idx (productId),
  CONSTRAINT storeDocumentLines_document_fk FOREIGN KEY (documentId) REFERENCES storeDocuments(id) ON DELETE CASCADE,
  CONSTRAINT storeDocumentLines_product_fk FOREIGN KEY (productId) REFERENCES storeProducts(id)
);

ALTER TABLE storeStockMovements
  ADD COLUMN documentId INT NULL AFTER transactionId,
  ADD COLUMN documentLineId INT NULL AFTER documentId,
  ADD KEY storeStockMovements_document_idx (documentId),
  ADD KEY storeStockMovements_document_line_idx (documentLineId),
  ADD CONSTRAINT storeStockMovements_document_fk FOREIGN KEY (documentId) REFERENCES storeDocuments(id) ON DELETE SET NULL,
  ADD CONSTRAINT storeStockMovements_document_line_fk FOREIGN KEY (documentLineId) REFERENCES storeDocumentLines(id) ON DELETE SET NULL;
