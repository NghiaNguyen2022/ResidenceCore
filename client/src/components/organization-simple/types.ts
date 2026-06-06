export type SimpleTab = 'structure' | 'assignments' | 'units' | 'terms';

export type TermStatus = 'active' | 'inactive' | 'closed';
export type AssignmentStatus = 'active' | 'ended';
export type UnitType = 'team' | 'committee';

export type OrganizationTerm = {
      id: number;
      code: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      status: TermStatus;
      description?: string | null;
      assignedCount?: number;
};

export type OrganizationRole = {
      id: number;
      code: string;
      name: string;
      category?: string | null;
      allowMultipleMembers?: boolean;
      isActive: boolean;
      sortOrder: number;
      level?: number | null;
      roleType?: string | null;
      minAssignees?: number | null;
      maxAssignees?: number | null;
      requiresUnit?: boolean | null;
};

export type OrganizationUnit = {
      id: number;
      code: string;
      name: string;
      unitType: UnitType | string;
      description?: string | null;
      isActive: boolean;
      sortOrder: number;
      assignedCount?: number;
};

export type OrganizationAssignment = {
      id: number;
      termId: number;
      roleId: number;
      residentId: number;
      roomId?: number | null;
      unitId?: number | null;
      assignmentTitle?: string | null;
      startDate: string | Date;
      endDate?: string | Date | null;
      status: AssignmentStatus;
      notes?: string | null;
      termName?: string;
      roleCode?: string;
      roleName?: string;
      residentName?: string;
      residentCode?: string;
      roomCode?: string | null;
      roomName?: string | null;
      unitCode?: string | null;
      unitName?: string | null;
      unitType?: string | null;
      roleLevel?: number | null;
      roleType?: string | null;
      roleRequiresUnit?: boolean | null;
};

export type AssignmentForm = {
      id?: number;
      termId: string;
      roleId: string;
      unitId: string;
      residentId: string;
      assignmentTitle: string;
      startDate: string;
      endDate: string;
      status: AssignmentStatus;
      notes: string;
};

export type UnitForm = {
      id?: number;
      code: string;
      name: string;
      unitType: UnitType;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

export type TermForm = {
      id?: number;
      code: string;
      name: string;
      startDate: string;
      endDate: string;
      status: TermStatus;
      description: string;
};
