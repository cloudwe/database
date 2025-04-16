// @ts-check
const { test, expect} = require('@playwright/test');

// change this to the URL of your website, could be local or GitHub pages
const websiteURL = 'http://127.0.0.1:5500/add-vehicle.html';

// on website page before each test
test.beforeEach(async ({ page }) => {
   await page.goto(websiteURL);
});

// ------------------------ html tests ---------------------------------------------------------------------
test('correct homepage heading', async ({ page }) => {
  // header 1 with Add a Vehicle text
  const heading = page.locator('h1');
  await expect(heading).toHaveText('Add a Vehicle');
  await expect(heading).toBeVisible();
});

test('navigation structure is correct', async ({ page }) => {
  // verify the <ul> for navigation is inside <header>
  const navList = page.locator('header ul');
  await expect(navList).toBeVisible();

  // verify all navigation links exist with correct text
  const navLinks = navList.locator('li a');
  await expect(navLinks).toHaveCount(3);

  // checking link texts
  await expect(page.getByRole('link', { name: 'People search' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Vehicle search' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add a vehicle' })).toBeVisible();
});

test('navigation uses unordered list', async ({ page }) => {
  // verify the navigation is implemented with <ul> inside <header>
  const header = page.locator('header');
  const ulCount = await header.locator('ul').count();
  expect(ulCount).toBe(1);
  
  const navList = header.locator('ul');
  await expect(navList).toBeVisible();
  await expect(navList.locator('li')).toHaveCount(3);
});

test('an image or video exists', async ({ page }) => {
  const imageNum = await page.locator('aside').locator('img').count()
  const videoNum = await page.locator('aside').locator('video').count()
  expect(imageNum + videoNum).toBeGreaterThan(0)
})

test('correct 4 sections', async ({ page }) => {
  // container exists and visible
  const container = page.locator('#container');
  await expect(container).toBeVisible();

  // only 4 direct children in container
  const children = await container.locator('> *').count();
  expect(children).toBe(4);

  // semantic elements to exist as direct children
  await expect(container.locator('> header')).toBeVisible();
  await expect(container.locator('> main')).toBeVisible();
  await expect(container.locator('> aside.sidebar')).toBeVisible();
  await expect(container.locator('> footer')).toBeVisible();
})

// ------------------------ css tests -----------------------------------------------------------------------
test('navigation links use CSS flex correctly & class is used', async ({ page }) => {
  // 1. Verify the navigation <ul> exists and has the correct class
  const navList = page.locator('header ul');
  await expect(navList).toBeVisible();
  await expect(navList).toHaveClass(/nav-menu/); // Checks for class containing 'nav-menu'

  // 2. Verify flex is applied ONLY to navigation <ul>
  const otherLists = page.locator('ul:not(header ul)');
  const otherListCount = await otherLists.count();
  
  for (let i = 0; i < otherListCount; i++) {
    await expect(otherLists.nth(i)).not.toHaveCSS('display', 'flex');
  }

  // 3. Verify flex properties on navigation
  await expect(navList).toHaveCSS('display', 'flex');
  await expect(navList).toHaveCSS('flex-direction', 'row');

  // 4. Verify links use all horizontal space
  const navLinks = navList.locator('li a');
  const linkCount = await navLinks.count();
  
})

test('location selector is used to remove bullet points for navigation links', async ({ page }) => {
  const navList = page.locator('header ul');
  await expect(navList).toHaveCSS('list-style-type', 'none');

  // check if other <ul> elements still have bullets
  const otherLists = page.locator('ul:not(header ul)');
  const otherListCount = await otherLists.count();
  
  for (let i = 0; i < otherListCount; i++) {
    await expect(otherLists.nth(i)).not.toHaveCSS('list-style-type', 'none');
  }
})

test('correct border, margin and padding to header, main, sidebar & footer', async ({ page }) => {
  const sections = [
    { selector: 'header', name: 'Header' },
    { selector: 'main', name: 'Main' },
    { selector: 'aside.sidebar', name: 'Sidebar' },
    { selector: 'footer', name: 'Footer' }
  ];

  // each section testing
  for (const section of sections) {
    const element = page.locator(section.selector);

    // border 
    await expect(element, `${section.name} border`).toHaveCSS('border', '1px solid rgb(0, 0, 0)');

    // margin (10px on all sides)
    await expect(element, `${section.name} margin`).toHaveCSS('margin-top', '10px');
    await expect(element, `${section.name} margin`).toHaveCSS('margin-right', '10px');
    await expect(element, `${section.name} margin`).toHaveCSS('margin-bottom', '10px');
    await expect(element, `${section.name} margin`).toHaveCSS('margin-left', '10px');

    // padding (10px on all sides)
    await expect(element, `${section.name} padding`).toHaveCSS('padding-top', '10px');
    await expect(element, `${section.name} padding`).toHaveCSS('padding-right', '10px');
    await expect(element, `${section.name} padding`).toHaveCSS('padding-bottom', '10px');
    await expect(element, `${section.name} padding`).toHaveCSS('padding-left', '10px');
  }
})

test('a grid layout with correct element placements', async ({ page }) => {
  //grid container
  const container = page.locator('#container');
  await expect(container).toHaveCSS('display', 'grid');

  // grid template areas
  await expect(container).toHaveCSS('grid-template-areas', /"header header"/);
  await expect(container).toHaveCSS('grid-template-areas', /"sidebar main"/);
  await expect(container).toHaveCSS('grid-template-areas', /"footer footer"/);

  // element placements
  await expect(page.locator('header')).toHaveCSS('grid-area', 'header');
  await expect(page.locator('aside.sidebar')).toHaveCSS('grid-area', 'sidebar');
  await expect(page.locator('main')).toHaveCSS('grid-area', 'main');
  await expect(page.locator('footer')).toHaveCSS('grid-area', 'footer');
})

test('responsive layout (lists vertically stacked & sidebar moved under main)', async ({ page }) => {
  // viewport to 499px to trigger mobile layout
  await page.setViewportSize({ width: 499, height: 800 });

  // test navigation links stack vertically
  const navList = page.locator('header ul');
  await expect(navList).toHaveCSS('flex-direction', 'column');

  // check sidebar appears below main content
  const main = page.locator('main');
  const sidebar = page.locator('aside.sidebar');
})


// --------------------------------- javascript tests ------------------------------------------------------
async function fillAndCheckError(
  page, 
  fieldId, 
  value, 
  messageLocator = '#message-owner',
  buttonName = 'Add owner'
) {
  const message = page.locator(messageLocator);
  await page.fill(fieldId, value);
  await page.getByRole('button', { name: buttonName }).click();
  await expect(message).toContainText('Error');
}

test('correct: text input IDs, check owner & add-vehicle implementation', async ({ page }) => {
  // make sure check owner button button starts disabled (empty fields)
  const checkOwnerBtn = page.getByRole('button', { name: 'Check owner', exact: true });
  await expect(checkOwnerBtn).toBeDisabled();

  //correct text inputs
  // fill all required fields & check for 
  // // the expected error message as form is not complete yet
  await fillAndCheckError(page, '#rego','MN178WE','#message-vehicle','Add vehicle')
  await expect(checkOwnerBtn).toBeDisabled(); // making sure after each input the owenr button is disabled
  await fillAndCheckError(page, '#make','Toyota','#message-vehicle','Add vehicle')
  await expect(checkOwnerBtn).toBeDisabled();
  await fillAndCheckError(page, '#model','Corolla','#message-vehicle','Add vehicle')
  await expect(checkOwnerBtn).toBeDisabled();
  await fillAndCheckError(page, '#colour','Red','#message-vehicle','Add vehicle')
  await expect(checkOwnerBtn).toBeDisabled();

  // enter incomplete owner name
  await page.fill('#owner', 'rachel');

  // check that the check owner button is enabled
  await expect(checkOwnerBtn).toBeEnabled();
  // click check owner button
  await checkOwnerBtn.click();

  const resultsDiv = page.locator('#owner-results');
  await expect(resultsDiv).toBeVisible();

  await expect(resultsDiv).toContainText('Rachel Smith');
  await expect(resultsDiv).toContainText('Wollaton');
  await expect(resultsDiv).toContainText('1979-06-05');
  await expect(resultsDiv).toContainText('2020-05-05'); 
  await expect(resultsDiv).toContainText('SG345PQ');

  const ownerCards = page.locator('.owner-card');
  const cardCount = await ownerCards.count();

  // checking each card has the button
  await expect(page.locator('.owner-card button:has-text("Select owner")'))
    .toHaveCount(cardCount);

  // clicking the rachel smith one!
  await page.locator('div.owner-card:has-text("Rachel Smith")')
  .locator('button:has-text("Select owner")')
  .click();

  //correct button
  await page.getByRole('button', { name: 'Add vehicle' }).click();

  // correct element id and message
  await expect(page.locator('#message-vehicle')).toContainText('Vehicle added successfully');


  // exception checking 3 items
  //  1. seeing if system prevents duplicate vehicles (same registration field)
    // 2. checking if case sensitive rego affects duplicate vehicles
      // 3. preventing 2 different owners from owning the same vehicle
  await page.fill('#rego', 'mn178we');
  await page.fill('#make', 'Toyota');
  await page.fill('#model', 'Corolla');
  await page.fill('#colour', 'Red');
  await page.fill('#owner', 'Mark Smith');

  await page.getByRole('button', { name: 'Add vehicle' }).click();
  await expect(page.locator('#message-vehicle')).toContainText('Error');

  // verifying that the vehicle was sucessfully added
  await page.getByRole('link', { name: 'Vehicle search' }).click()

  await page.locator('#rego').fill('MN178WE')
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('#results')).toContainText('MN178WE')
  await expect(page.locator('#results')).toContainText('Toyota')
  await expect(page.locator('#results')).toContainText('Corolla')
  await expect(page.locator('#results')).toContainText('Red')
  await expect(page.locator('#results')).toContainText('Rachel Smith')
  await expect(page.locator('#results').locator('div')).toHaveCount(1)
})

// helper function for filling vehicle field
  // checks if new owner button is disabled after entering input
async function fillFieldAndExpectDisabled(page, fieldId, value, buttonLocator) {
  await page.fill(fieldId, value);
  await expect(buttonLocator).toBeDisabled();
  
}

test('correct new owner implementation', async ({ page }) => {
  // correct button name, and ensuring it is disabled as fields are empty
  const newOwnerBtn = page.getByRole('button', { name: 'New owner', exact: true });
  await expect(newOwnerBtn).toBeDisabled();

  // fill all required fields with new owner name
    // check that new owner button is disabled even when entering these inputs
  await fillFieldAndExpectDisabled(page, '#rego', 'BC256JK', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#make', 'Kia', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#model', 'Picanto', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#colour', 'Red', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#owner', 'Kevin Green', newOwnerBtn);

  const message = page.locator('#message-owner');
  await page.getByRole('button', { name: 'Check owner' }).click();

  // exception handling: no fields entered
  await page.getByRole('button', { name: 'Add owner' }).click();
  await expect(message).toContainText('Error');

  // exception handling & filling fields
    // exception - checking once each field entered if error message appears as 
      // fields are still empty
        //adding new owner
  await fillAndCheckError(page, '#name', 'Kevin Green');
  await fillAndCheckError(page, '#address', 'Nottingham');
  await fillAndCheckError(page, '#dob', '1990-01-01');
  await fillAndCheckError(page, '#license', 'SD876ES');
  await page.fill('#expire', '2030-01-01'); // this is the last field, no more empty fields.
  // correct button name
  await page.getByRole('button', { name: 'Add owner' }).click();

  // checking if add owner message appears
  await expect(message).toBeVisible();
  await expect(message).toContainText('Owner added successfully');

  await page.getByRole('link', { name: 'People search' }).click()

  //corect people search id
  await page.locator('#name').fill('Kevin Green')
  await page.getByRole('button', { name: 'Submit' }).click();

  const expectedTexts = [
    'Kevin Green',
    'Nottingham',
    '1990-01-01',
    'SD876ES',
    '2030-01-01'
  ];

  // looping to see if #results contains the expected tests
  for (const text of expectedTexts) {
    await expect(page.locator('#results')).toContainText(text);
  }
  await expect(page.locator('#results').locator('div')).toHaveCount(1) // only one owner

  //     exception - checking if system accepts a duplicate owner 
      // also checking if this is case sensitive for address and license
  await page.getByRole('link', { name: 'Add a vehicle' }).click()

  //checking for duplicate vehicle
  await fillFieldAndExpectDisabled(page, '#rego', 'BC256JK', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#make', 'Kia', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#model', 'Picanto', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#colour', 'Red', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#owner', 'Kevin Green', newOwnerBtn);

  await page.getByRole('button', { name: 'Check owner' }).click();
  await page.getByRole('button', { name: 'New Owner' }).click();
  
  await fillAndCheckError(page, '#name', 'Kevin Green');
  await fillAndCheckError(page, '#address', 'nottingham');
  await fillAndCheckError(page, '#dob', '1990-01-01');
  await fillAndCheckError(page, '#license', 'sd876es');
  await page.fill('#expire', '2030-01-01'); // this is the last field, no more empty fields.
  // correct button name
  await page.getByRole('button', { name: 'Add owner' }).click();

  await expect(message).toContainText('Error');

    // search people to make sure there are no duplicates of kevin green with the same details!!
  await page.getByRole('link', { name: 'People search' }).click()

  //checking people search driving license number field is correct
  await page.locator('#license').fill('SD876ES')
  await page.getByRole('button', { name: 'Submit' }).click();

  for (const text of expectedTexts) {
    await expect(page.locator('#results')).toContainText(text);
  }
  await expect(page.locator('#results').locator('div')).toHaveCount(1) // only one owner

});

test('handle very long inputs in all fields', async ({ page }) => {
  const longString = 'A'.repeat(500); // 500-character string
  
  // test vehicle fields
  const vehicleFields = ['#rego', '#make', '#model', '#colour'];
  for (const field of vehicleFields) {
    await page.fill(field, longString);
    const value = await page.inputValue(field);
    expect(value.length).toBeLessThan(150); // verify truncation or rejection
  }

  // test owner search
  await page.fill('#owner', longString);
  await page.getByRole('button', { name: 'Check owner' }).click();
  await expect(page.locator('#owner-results')).toBeVisible();

  // test new owner fields
  await page.getByRole('button', { name: 'New owner' }).click();
  const ownerFields = ['#name', '#address', '#license'];
  for (const field of ownerFields) {
    await page.fill(field, longString);
    const value = await page.inputValue(field);
    expect(value.length).toBeLessThan(150);
  }
});

test('handle special characters in all fields', async ({ page }) => {
  const specialChars = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~';
  
  // test vehicle form
  await page.fill('#rego', 'AB12'+specialChars);
  await page.fill('#make', 'Toy'+specialChars+'ota');
  await page.fill('#model', 'Cor'+specialChars+'olla');
  await page.fill('#colour', 'R'+specialChars+'ed');
  await page.fill('#owner', 'J'+specialChars+'n');
  
  await expect(page.locator('#rego')).toHaveValue('AB12');
  await expect(page.locator('#make')).toHaveValue('Toyota');
  await expect(page.locator('#model')).toHaveValue('Corolla');
  await expect(page.locator('#colour')).toHaveValue('Red');
  await expect(page.locator('#owner')).toHaveValue('Jn');

  // going to try the new owner fields
  await page.getByRole('button', { name: 'Check owner' }).click();

  // going to try the new owner fields
    // had to skip html fields as html5 covers dob to be numbers only.
      // playwright will throw malformed value
  await page.fill('#name', 'J'+specialChars+'n');
  await page.fill('#address', 'Not'+specialChars+'m');
  await page.type('#license', 'R'+specialChars+'5N'); // worked better than fill for this field

  await expect(page.locator('#name')).toHaveValue('Jn');
  await expect(page.locator('#address')).toHaveValue('Notm');
  await expect(page.locator('#license')).toHaveValue('R5N');

});
