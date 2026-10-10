import {
  createListenerMiddleware,
  type TypedStartListening,
} from "@reduxjs/toolkit";

export const listenerMiddleware = createListenerMiddleware();
export const startAppListening =
  listenerMiddleware.startListening as TypedStartListening<
    RootState,
    AppDispatch
  >;

export function registerListeners() {
  //? Регистрация слушателей
  //   settingsListeners();
  //   gameListeners();
}
