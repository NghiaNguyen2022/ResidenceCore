type LoginUserLike = {
      role?: string | null;
      roles?: string[] | null;
};

export function getPostLoginPath(user?: LoginUserLike | null) {
      const roles = new Set<string>();

      if (user?.role) roles.add(user.role);
      user?.roles?.forEach((role) => roles.add(role));

      if (roles.has("manager")) return "/dashboard";
      if (roles.has("resident")) return "/resident/today";

      return "/";
}
