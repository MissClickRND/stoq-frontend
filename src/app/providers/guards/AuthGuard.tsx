import { useStatusQuery } from "@/entities/auth";
import { selectUser } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import { Alert, Button, Center, Loader, Stack } from "@mantine/core";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useAppSelector(selectUser);
  const location = useLocation();
  const { data, isLoading, isFetching, error, refetch } = useStatusQuery(undefined, {
    skip: user.sessionStatus === "anonymous",
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true,
  });
  if (user.sessionStatus === "anonymous") return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (isLoading || (isFetching && !data))
    return <Center mih="100svh" role="status" aria-label="Проверка сессии"><Loader /></Center>;
  if (error && !("status" in error && (error.status === 401 || error.status === 403))) {
    return <Center mih="100svh"><Stack maw={480} p="lg"><Alert color="red" role="alert">
      Не удалось проверить сессию. Проверьте соединение и доступность сервера.
    </Alert><Button onClick={() => refetch()}>Повторить</Button></Stack></Center>;
  }
  if (!user.id) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
