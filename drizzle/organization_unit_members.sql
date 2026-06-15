CREATE TABLE IF NOT EXISTS organization_unit_members (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      unit_id INT NOT NULL,
      resident_id INT NOT NULL,
      member_role ENUM('member', 'leader', 'head') NOT NULL DEFAULT 'member',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      start_date DATE NOT NULL,
      end_date DATE NULL,
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      CONSTRAINT fk_org_unit_members_unit
            FOREIGN KEY (unit_id)
            REFERENCES organization_units(id)
            ON DELETE CASCADE,

      CONSTRAINT fk_org_unit_members_resident
            FOREIGN KEY (resident_id)
            REFERENCES residents(id)
            ON DELETE CASCADE,

      INDEX idx_organization_unit_members_unit (unit_id),
      INDEX idx_organization_unit_members_resident (resident_id),
      INDEX idx_organization_unit_members_status (status),
      INDEX idx_org_unit_members_unit_resident_status (unit_id, resident_id, status)
);
