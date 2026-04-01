export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You are not allowed to access this resource" });
    }
    next();
  };
}

export const isAdmin = allowRoles("admin");
export const isStaffOrAdmin = allowRoles("staff", "admin");

export function allowSelfOrRoles(getUserId, ...roles) {
  return (req, res, next) => {
    const requestedUserId = Number(getUserId(req));

    if (Number(req.user?.id) === requestedUserId || roles.includes(req.user?.role)) {
      return next();
    }

    return res.status(403).json({ error: "You are not allowed to access this user resource" });
  };
}
