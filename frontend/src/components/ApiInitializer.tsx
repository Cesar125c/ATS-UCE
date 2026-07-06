import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { initApi } from "@/services/api";

export default function ApiInitializer() {
  const { getToken } = useAuth();

  useEffect(() => {
    initApi(getToken);
  }, [getToken]);

  return null;
}
