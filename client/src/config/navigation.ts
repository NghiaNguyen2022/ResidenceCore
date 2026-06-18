export type {
      AppRole,
      DisplayMode,
      NavigationItem,
} from "@/navigation";

export {
      appointedResidentNavigation,
      detailedManagerNavigation,
      getNavigationByRoles,
      residentNavigation,
      simpleManagerNavigation,
} from "@/navigation";

import { simpleManagerNavigation } from "@/navigation";

export const navigationItems = simpleManagerNavigation;
