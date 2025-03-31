import fontFinder from "font-finder";
import { Hono } from "hono";
import Bun from "bun";
import { tryCatch } from "./utils";
import { basename } from "node:path";
import { logger } from "hono/logger";

const flags = process.argv
  .slice(2)
  .filter((arg) => arg.startsWith("--"))
  .reduce(
    (acc, arg) => {
      const [key, value] = arg.slice(2).split(/[=\s]/).filter(Boolean);
      const nextArg = process.argv[process.argv.indexOf(arg) + 1];
      return {
        ...acc,
        [key]: value || (!nextArg?.startsWith("--") ? nextArg : undefined),
      };
    },
    {
      directory: process.cwd(), // default value
      port: 44950, // default value
    } as {
      directory: string;
      port: number;
      [key: string]: string | number | undefined | null;
    }
  );

const fonts = await fontFinder.list();
const app = new Hono();

app.use(logger());

const fontStylesByWeight = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

app.get("/figma/font-files", async (ctx) => {
  ctx.header("Content-Type", "application/json");
  ctx.header("Access-Control-Allow-Private-Network", "true");
  ctx.header("Access-Control-Allow-Origin", "https://www.figma.com");

  return ctx.json({
    version: 4,
    fontFiles: Object.fromEntries(
      Object.entries(fonts).flatMap(([family, weights]) =>
        weights
          .filter((val, i, arr) => {
            const sameWeightFonts = arr.filter((w) => w.weight === val.weight);
            const currentIsItalic = val.path.toLowerCase().includes("italic");

            // Keep if it's the only font with this weight
            if (sameWeightFonts.length === 1) return true;

            // For multiple fonts with same weight, keep first normal and first italic
            return (
              sameWeightFonts
                .filter(
                  (w) =>
                    w.path.toLowerCase().includes("italic") === currentIsItalic
                )
                .indexOf(val) === 0
            );
          })
          .map((weight) => {
            const isItalic = weight.path.toLowerCase().includes("italic");
            const style =
              isItalic && weight.weight === 400
                ? "Italic"
                : `${
                    fontStylesByWeight[
                      weight.weight as keyof typeof fontStylesByWeight
                    ] || "Regular"
                  } ${isItalic ? "Italic" : ""}`.trim();

            return [
              weight.path,
              [
                {
                  postscript: basename(weight.path).split(".").shift(),
                  family,
                  id: family,
                  style,
                  weight: weight.weight,
                  stretch: 5,
                  italic: isItalic,
                },
              ],
            ];
          })
      )
    ),
  });
});

app.get("/figma/font-file", async (ctx) => {
  const path = ctx.req.query("file");
  if (!path) {
    return ctx.text("File path is required", 400);
  }

  const file = Bun.file(path);
  if (!(await file.exists())) {
    return ctx.text("File not found", 404);
  }

  const [contents, error] = await tryCatch(() => file.arrayBuffer());
  if (error) {
    console.error(error);
    return ctx.text("Error reading file", 500);
  }

  ctx.header("Content-Type", "application/octet-stream");
  ctx.header("Access-Control-Allow-Private-Network", "true");
  ctx.header("Access-Control-Allow-Origin", "https://www.figma.com");

  return ctx.body(contents, 200);
});

export default {
  port: flags.port,
  fetch: app.fetch,
};
