import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PermissionGate({ permission, fallback = null, children }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
}
