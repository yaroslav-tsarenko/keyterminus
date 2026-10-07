import { erase } from "../define";
import type { AnyScene, SceneId } from "../types";

export const sceneLoaders: Record<SceneId, () => Promise<AnyScene>> = {
  checkin: () => import("./checkin").then((m) => erase(m.checkin)),
  pay: () => import("./pay").then((m) => erase(m.pay)),
  depart: () => import("./depart").then((m) => erase(m.depart)),
  arrive: () => import("./arrive").then((m) => erase(m.arrive)),
  help: () => import("./help").then((m) => erase(m.help)),
};
