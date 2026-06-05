import { useQuery } from "@tanstack/react-query";

import {
  getDashboardRequest,
} from "../services/dashboard.service";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardRequest,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};