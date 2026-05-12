-- Tabla de negocios
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[businesses]') AND type = N'U')
BEGIN
  CREATE TABLE businesses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
  );
END

-- Tabla de transacciones (depósitos/retiros)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND type = N'U')
BEGIN
  CREATE TABLE transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    business_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'deposit' or 'withdrawal'
    amount DECIMAL(10, 2) NOT NULL,
    description NVARCHAR(MAX),
    fincore_tx_id VARCHAR(255), -- ID de transacción de FinCore
    fincore_status VARCHAR(50),
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_transactions_businesses FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  );
END

-- Tabla de saldos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[balances]') AND type = N'U')
BEGIN
  CREATE TABLE balances (
    id INT IDENTITY(1,1) PRIMARY KEY,
    business_id INT NOT NULL UNIQUE,
    current_balance DECIMAL(10, 2) DEFAULT 0.00,
    total_income DECIMAL(10, 2) DEFAULT 0.00,
    total_expenses DECIMAL(10, 2) DEFAULT 0.00,
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_balances_businesses FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
  );
END

-- Índices para optimización
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND name = N'idx_transactions_business_id')
BEGIN
  CREATE INDEX idx_transactions_business_id ON transactions(business_id);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND name = N'idx_transactions_created_at')
BEGIN
  CREATE INDEX idx_transactions_created_at ON transactions(created_at);
END
