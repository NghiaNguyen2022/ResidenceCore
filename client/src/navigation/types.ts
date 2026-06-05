export type AppRole =
      | "manager"
      | "resident"
      | "team_leader"
      | "committee_head"
      | "house_leader"
      | "deputy"
      | "secretary"
      | "treasurer";

export type DisplayMode = "simple" | "detailed";

export type NavigationItem = {
      label: string;
      path?: string;
      icon?: string;
      roles?: AppRole[];
      badge?: string;
      disabled?: boolean;
      children?: NavigationItem[];
};