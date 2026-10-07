import "dotenv/config";
import { refreshBoardScores } from "../src/lib/catalog/board-score";
import { prisma } from "../src/lib/prisma";

const t0 = Date.now();
refreshBoardScores()
  .then((r) => console.log(`[board-scores] scored=${r.scored} ranked=${r.ranked} in ${Date.now() - t0}ms`))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
