import { useStatusQuery } from "@/entities/auth";
import { setUser, userLogout } from "@/entities/user";

import { useAppDispatch } from "@/shared/lib";
import { LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const [visibleLoading, setVisibleLoading] = useState(true);
  const { data, isLoading, isError } = useStatusQuery();

  useEffect(() => {
    if (data) {
      dispatch(setUser(data.user));
    }

    if (isError) {
      dispatch(userLogout());
    }
  }, [data, isError]);

  useEffect(() => {
    setTimeout(() => {
      setVisibleLoading(isLoading);
    }, 500);
  }, [isLoading]);

  return (
    <>
      <LoadingOverlay visible={visibleLoading} pos="fixed" />
      {children}
    </>
  );
};
