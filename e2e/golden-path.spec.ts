import { expect, test } from '@playwright/test'

// Mirrors PRD §7.1: enter a character via the joystick, see candidates
// narrow, dwell a bubble to stage it, confirm to share. Never speaks/sends
// without the explicit confirm step (NFR3).
test('compose a phrase via joystick and confirm-to-share', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.goto('/')
  await expect(page.getByText('Peri', { exact: true })).toBeVisible()

  // Some default candidates should be visible before any input.
  await expect(page.locator('.bubble').first()).toBeVisible()

  // Dwell the NE joystick zone ("e t") to open that letter group.
  const neZone = page.locator('.joystick__zone').filter({ hasText: 'e t' }).first()
  await neZone.hover()
  await page.waitForTimeout(700)

  // Dwell "e" to type it — only one phrase in the bank starts with "e".
  const eTarget = page.locator('.dwell-target').filter({ hasText: /^e$/ }).first()
  await eTarget.hover()
  await page.waitForTimeout(700)
  await expect(page.locator('.joystick__buffer')).toHaveText('e')
  await expect(page.locator('.bubble')).toHaveText(['excuse me'])

  // Dwell the candidate to stage it — staging must not speak/send by itself.
  await page.locator('.bubble').first().hover()
  await page.waitForTimeout(600)
  await expect(page.locator('.staged-panel__text')).toHaveText('excuse me')
  await expect(page.locator('.joystick')).toHaveCount(0)

  // Confirm-to-share: stub the clipboard so headless Chromium doesn't hang
  // on a native permission prompt, then confirm.
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
    })
  })
  const shareButton = page
    .locator('.staged-panel__actions .dwell-target')
    .filter({ hasText: 'Copy / Share' })
  await shareButton.hover()
  await page.waitForTimeout(600)

  // Back to a blank entering state, ready for the next phrase.
  await expect(page.locator('.joystick')).toBeVisible()
  await expect(page.locator('.joystick__buffer')).toHaveText('')

  expect(consoleErrors).toEqual([])
})
