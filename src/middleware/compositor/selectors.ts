import type {
  UserShellCompositorState,
  UserShellScene,
  UserShellSurface,
  UserShellSurfaceView,
} from "../../store/compositor";
import type { UserShellSurfaceKey } from "./CompositorApi";

export const viewsByUserShellSurfaceKey = (
  state: { compositor: UserShellCompositorState },
  userSurfaceKey: UserShellSurfaceKey
): UserShellSurfaceView[] =>
  Object.values(state.compositor.scenes)
    .map((scene) => scene.views)
    .flat()
    .filter((view) => view.surfaceKey === userSurfaceKey);

export const userShellSurfaceKeyByPointerGrab = (state: {
  compositor: UserShellCompositorState;
}): string | undefined => state.compositor.seat.pointerGrab;

export const userShellSurfaceKeyByKeyboardFocus = (state: {
  compositor: UserShellCompositorState;
}): string | undefined => state.compositor.seat.keyboardFocus;

const lastActiveSceneFrom = (scenes: UserShellScene[]): UserShellScene =>
  scenes.reduce((previousValue, currentValue) =>
    previousValue.lastActive > currentValue.lastActive
      ? previousValue
      : currentValue
  );

export const userShellSceneByLastActive = (state: {
  compositor: UserShellCompositorState;
}): UserShellScene =>
  lastActiveSceneFrom(Object.values(state.compositor.scenes));

export const userShellSceneByLastActiveExcludingId = (
  state: { compositor: UserShellCompositorState },
  sceneId: string
): UserShellScene =>
  lastActiveSceneFrom(
    Object.values(state.compositor.scenes).filter(
      (scene) => scene.id !== sceneId
    )
  );

export const userShellSurfacesByClientId = (
  state: { compositor: UserShellCompositorState },
  clientId: string
): UserShellSurface[] =>
  Object.values(state.compositor.surfaces).filter(
    (userSurface) => userSurface.clientId === clientId
  );

export const userShellSceneById = (
  state: { compositor: UserShellCompositorState },
  sceneId: string
): UserShellScene => state.compositor.scenes[sceneId];
