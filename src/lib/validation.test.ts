import { describe, expect, it } from "vitest";
import { clampDailyGoal, isValidDateOnly, isValidTaskCategory, isValidTaskPriority, normalizeTaskTitle, parseFocusDuration } from "@/lib/validation";

describe("normalizeTaskTitle", () => {
  it("remove espaços duplicados e espaços nas pontas", () => {
    expect(normalizeTaskTitle("  Estudar   matemática  ")).toBe("Estudar matemática");
  });
  it("limita títulos a 90 caracteres", () => {
    expect(normalizeTaskTitle("x".repeat(120))).toHaveLength(90);
  });
  it("retorna string vazia para título sem conteúdo", () => {
    expect(normalizeTaskTitle("   ")).toBe("");
  });
});

describe("isValidDateOnly", () => {
  it("aceita uma data real no formato ISO", () => {
    expect(isValidDateOnly("2024-02-29")).toBe(true);
  });
  it("rejeita datas inexistentes e formatos inválidos", () => {
    expect(isValidDateOnly("2025-02-29")).toBe(false);
    expect(isValidDateOnly("29/02/2024")).toBe(false);
  });
});

describe("clampDailyGoal", () => {
  it("mantém metas dentro do intervalo permitido", () => {
    expect(clampDailyGoal(0)).toBe(1);
    expect(clampDailyGoal(12.8)).toBe(12);
    expect(clampDailyGoal(50)).toBe(30);
  });
  it("usa o valor padrão para entradas inválidas", () => {
    expect(clampDailyGoal(Number.NaN)).toBe(3);
  });
});

describe("parseFocusDuration", () => {
  it("aceita minutos inteiros entre 1 e 180", () => {
    expect(parseFocusDuration(1)).toBe(1);
    expect(parseFocusDuration(25)).toBe(25);
    expect(parseFocusDuration(180)).toBe(180);
  });
  it("rejeita valores fora do intervalo ou fracionários", () => {
    expect(parseFocusDuration(0)).toBeNull();
    expect(parseFocusDuration(181)).toBeNull();
    expect(parseFocusDuration(2.5)).toBeNull();
    expect(parseFocusDuration(Number.POSITIVE_INFINITY)).toBeNull();
  });
});


describe("category and priority validation", () => {
  it("accepts only supported task categories", () => {
    expect(isValidTaskCategory("study")).toBe(true);
    expect(isValidTaskCategory("admin")).toBe(false);
  });
  it("accepts only supported priorities", () => {
    expect(isValidTaskPriority("high")).toBe(true);
    expect(isValidTaskPriority("urgent")).toBe(false);
  });
});
