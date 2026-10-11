import { mockDependencyGraph } from "../model/mock.ts";

export function useDependencyGraph() {
  //! Подключить GET карты зависимостей: сервер возвращает nodes и edges без координат.
  return { graph: mockDependencyGraph };
}
