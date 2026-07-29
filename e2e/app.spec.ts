import { test, expect } from "@playwright/test";

test.describe("Học Hành Lắm 🍃 - End-to-End Application Flows", () => {
  test("Dashboard page loads and displays brand title", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/Học Hành Lắm/i);
  });

  test("Vocabulary page loads and allows search filtering", async ({ page }) => {
    await page.goto("/vocabulary");
    await expect(page.locator("h1")).toContainText("Kho Từ Vựng");
  });

  test("Grammar page loads and displays grammar topics", async ({ page }) => {
    await page.goto("/grammar");
    await expect(page.locator("h1")).toContainText("Cấu Trúc Ngữ Pháp");
  });

  test("Flashcards SRS review page renders SuperMemo-2 deck", async ({ page }) => {
    await page.goto("/flashcards");
    await expect(page.locator("h1")).toContainText("Thẻ Ghi Nhớ");
  });

  test("AI Tutor Hub page allows agent selection", async ({ page }) => {
    await page.goto("/ai-tutor");
    await expect(page.locator("h1")).toContainText("Trung Tâm Trợ Lý AI");
  });

  test("Document Center page renders dropzone for PDF and OCR", async ({ page }) => {
    await page.goto("/documents");
    await expect(page.locator("h1")).toContainText("Document Center");
  });

  test("Learning module page renders 8 game modes", async ({ page }) => {
    await page.goto("/learning");
    await expect(page.locator("h1")).toContainText("Trung Tâm Luyện Tập");
  });

  test("Library page renders folders and media assets", async ({ page }) => {
    await page.goto("/library");
    await expect(page.locator("h1")).toContainText("Thư Viện Tri Thức");
  });

  test("Settings page allows configuring profile and API key", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Trung Tâm Cài Đặt");
  });
});
