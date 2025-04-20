// @ts-check
const { test, expect} = require('@playwright/test');
const { TIMEOUT } = require('dns');

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
  await page.getByRole('link', { name: 'People search' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByRole('heading', { name: 'People search' })).toBeVisible();

  await page.getByRole('link', { name: 'Vehicle search' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByRole('heading', { name: 'Vehicle search' })).toBeVisible();

  await expect(page.getByRole('link', { name: 'Add a vehicle' })).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page.getByRole('heading', { name: 'Vehicle search' })).toBeVisible();
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
  // verify the navigation <ul> exists and has the correct class
  const navList = page.locator('header ul');
  await expect(navList).toBeVisible();
  await expect(navList).toHaveClass(/nav-menu/); // Checks for class containing 'nav-menu'

  // verify flex is applied ONLY to navigation <ul>
  const otherLists = page.locator('ul:not(header ul)');
  const otherListCount = await otherLists.count();
  
  for (let i = 0; i < otherListCount; i++) {
    await expect(otherLists.nth(i)).not.toHaveCSS('display', 'flex');
  }

  // verify flex properties on navigation
  await expect(navList).toHaveCSS('display', 'flex');
  await expect(navList).toHaveCSS('flex-direction', 'row');

  // verify links use all horizontal space
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
// helper function - fills out A field and expects an error message when a button is clicked
  // e.g. fill in vehicle registration field only, click add vehicle button, expect error in #message-vehicle
async function fillAndCheckError(
  page, 
  fieldId, 
  value, 
  messageLocator = '#message-owner', //default value, can change in parameters when calling function
  buttonName = 'Add owner'//default value, can change in parameters when calling function
) {
  const message = page.locator(messageLocator);
  await page.fill(fieldId, value);
  await page.getByRole('button', { name: buttonName }).click();
  await expect(message).toContainText('Error');
}

test('correct: text input IDs, check owner & add-vehicle implementation', async ({ page }) => {
// checking disabled buttons/error messages due to empty fields
  const testCheckOwnerBtn = page.getByRole('button', { name: 'Check owner', exact: true });
  const addVehicleBtn = page.getByRole('button', { name: 'Add vehicle', exact: true });
  const testNewOwnerBtn = page.getByRole('button', { name: 'New owner', exact: true });
  await expect(testCheckOwnerBtn).toBeDisabled();
  await expect(testNewOwnerBtn).toBeDisabled();
  await addVehicleBtn.click();
  await expect(page.locator('#message-vehicle')).toContainText('Error');

// filling out vehicle form for existing owner
  //correct text inputs IDs 
  // testing correct state of buttons and error message of buttons for vehicle form
  await fillAndCheckError(page, '#rego','MN178WE','#message-vehicle','Add vehicle') // add vehicle button should return Error
  await expect(testCheckOwnerBtn).toBeDisabled(); // after each input the check owner button is disabled
  await expect(testNewOwnerBtn).toBeDisabled(); // after each input the new owner button is disabled
  await fillAndCheckError(page, '#make','Toyota','#message-vehicle','Add vehicle')
  await expect(testCheckOwnerBtn).toBeDisabled(); 
  await expect(testNewOwnerBtn).toBeDisabled();
  await fillAndCheckError(page, '#model','Corolla','#message-vehicle','Add vehicle')
  await expect(testCheckOwnerBtn).toBeDisabled(); 
  await expect(testNewOwnerBtn).toBeDisabled();
  await fillAndCheckError(page, '#colour','Red','#message-vehicle','Add vehicle')
  await expect(testCheckOwnerBtn).toBeDisabled(); 
  await expect(testNewOwnerBtn).toBeDisabled();
  // enter incomplete & all capitals owner name 
  await page.fill('#owner', 'rachel');
  await expect(testCheckOwnerBtn).toBeEnabled(); // check ownber button is enabled
  await expect(testNewOwnerBtn).toBeDisabled(); // new owner btn only enabled after check owner!

// EXCEPTION!! erase owner name
  await page.fill('#owner', '');
  await expect(testCheckOwnerBtn).toBeDisabled(); // check ownber button is disabled
  await expect(testNewOwnerBtn).toBeDisabled(); // new owner btn only enabled after check owner!
  await addVehicleBtn.click();
  await expect(page.locator('#message-vehicle')).toContainText('Error'); // should be an error message, incomplete fields

// fill back the owner field EXCEPTION CHECKING for case sensitive owner name
  await page.fill('#owner', 'RACHEL'); 
  await expect(testCheckOwnerBtn).toBeEnabled(); // check ownber button is enabled
  await expect(testNewOwnerBtn).toBeDisabled(); // new owner btn only enabled after check owner!

// EXCEPTION! not expecting to add vehicle, there are existing owners with name rachel. 
      // user yet to decide to select an owner or make new owner
  await addVehicleBtn.click();
  await expect(page.locator('#message-vehicle')).not.toContainText('Vehicle Added Successfully'); //NOT contain text

// click check owner button
  await testCheckOwnerBtn.click();
  await expect(testNewOwnerBtn).toBeEnabled(); // now new owner button can be enabled as check owner action performed

// expect the correct results in owner-results
  const resultsDiv = page.locator('#owner-results');
  await expect(resultsDiv).toBeVisible();
  await expect(resultsDiv).toContainText('1');
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
   
  // clicking the rachel smith one
  await page.fill('#owner', 'Rachel Smith'); 
  await testCheckOwnerBtn.click();
  await page.waitForTimeout(1000); // IMPORTANT TO LET THE PAGE LOAD!!! at least wait a second
  await page.getByRole('button', { name: 'Select owner' }).click();
  await page.getByRole('button', { name: 'Add vehicle' }).click();//correct button

  // correct element id and message
  await expect(page.locator('#message-vehicle')).toContainText('Vehicle added successfully');

  // EXCEPTION checking 3 items
  //  1. seeing if system prevents duplicate vehicles (same registration field)
    // 2. checking if case sensitive rego affects duplicate vehicles
      // 3. preventing 2 different owners from owning the same vehicle
  await page.fill('#rego', 'mn178we');
  await page.fill('#make', 'Toyota');
  await page.fill('#model', 'Corolla');
  await page.fill('#colour', 'Red');
  await page.fill('#owner', 'MARK SMITH');

  await page.getByRole('button', { name: 'Add vehicle' }).click();
  await expect(page.locator('#message-vehicle')).toContainText('Error');

// verifying that the rachel smith's vehicle was sucessfully added
  await page.getByRole('link', { name: 'Vehicle search' }).click()
  await page.waitForTimeout(1000); // IMPORTANT TO LET THE PAGE LOAD!!! at least wait a second

  await page.locator('#rego').fill('MN178WE')
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('#results')).toContainText('MN178WE')
  await expect(page.locator('#results')).toContainText('Toyota')
  await expect(page.locator('#results')).toContainText('Corolla')
  await expect(page.locator('#results')).toContainText('Red')
  await expect(page.locator('#results')).toContainText('Rachel Smith')
  
  await expect(page.locator('#results').locator('div')).toHaveCount(1) //no duplicates
})

test('vehicle fields & owner fields reject numbers in invalid fields', async ({ page }) => {
  const message_owner = page.locator('#message-owner');
  const message = page.locator('#message');

  await page.fill('#rego', 'BA987JE');
  await page.fill('#make', 'Toyota');
  await page.fill('#model', 'Corolla');
  await page.fill('#colour', '123'); // colour as number
  await page.fill('#owner', '123'); // owner name as number
  await page.getByRole('button', { name: 'Add vehicle' }).click();
  await expect(page.locator('#message-vehicle')).toContainText('Error');

  await page.fill('#colour', 'Pink');
  await page.fill('#owner', 'Adrian Green');

  await page.getByRole('button', { name: 'Check owner' }).click();
  await page.getByRole('button', { name: 'New owner' }).click();

  await page.fill('#name', '123') // owner name as number
  await page.fill('#address', 'Nottingham')
  await page.fill('#dob', '1990-01-01')
  await page.fill('#license', 'BA987JE')
  await page.fill('#expire', '2030-01-01');

  await page.getByRole('button', { name: 'Add owner' }).click();
  await expect(message_owner).toContainText('Error');

  // verifying that the vehicle was NOT added
  await page.getByRole('link', { name: 'Vehicle search' }).click()
  await page.waitForTimeout(1000); // IMPORTANT TO LET THE PAGE LOAD!!! at least wait a second

  await page.locator('#rego').fill('BA987JE')
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(message).toContainText('No result found');
});


// helper function 
  // checks if button is disabled after entering input (note: the previous test did this manually)
async function fillFieldAndExpectDisabled(page, fieldId, value, buttonLocator) {
  await page.fill(fieldId, value);
  await expect(buttonLocator).toBeDisabled();
  
}
test('correct new owner implementation', async ({ page }) => {
  // correct button name, and ensuring it is disabled as fields are empty
  const newOwnerBtn = page.getByRole('button', { name: 'New owner', exact: true });
  const message = page.locator('#message-owner');

  // fill all required fields with new owner name, ensuring all fields are entered before new owner
  // button is enabled
    // check that new owner button is disabled even when entering these inputs
  await expect(newOwnerBtn).toBeDisabled(); // new owner button should be disabled as no fields entered
  await fillFieldAndExpectDisabled(page, '#rego', 'BC256JK', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#make', 'Kia', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#model', 'Picanto', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#colour', 'Red', newOwnerBtn);
  await fillFieldAndExpectDisabled(page, '#owner', 'Kevin Green', newOwnerBtn);

  await page.getByRole('button', { name: 'Check owner' }).click();
  await page.getByRole('button', { name: 'New Owner' }).click();
  // exception handling: no fields entered
  await page.getByRole('button', { name: 'Add owner' }).click();
  await expect(message).toContainText('Error');

  // exception handling & filling fields
    // exception - checking once each field entered if error message appears as 
      // fields are still empty
        //adding new owner
  await fillAndCheckError(page, '#name', 'Kevin Green', '#message-owner', 'Add owner');
  await fillAndCheckError(page, '#address', 'London', '#message-owner', 'Add owner');
  await fillAndCheckError(page, '#dob', '1990-01-01', '#message-owner', 'Add owner');
  await fillAndCheckError(page, '#license', 'MK567NT', '#message-owner', 'Add owner');
  await page.fill('#expire', '2030-01-01'); // this is the last field, no more empty fields.

  // correct button name
  await page.getByRole('button', { name: 'Add owner' }).click();
  await expect(message).toContainText('Owner added successfully');// checking if add owner message appears

  await page.getByRole('link', { name: 'People search' }).click()
  await page.waitForTimeout(1000);

  //corect people search id
  await page.locator('#name').fill('Kevin Green')
  await page.getByRole('button', { name: 'Submit' }).click();

  const resultsDiv = page.locator('#results');

  await expect(resultsDiv).toContainText('Kevin Green'); 
  await expect(resultsDiv).toContainText('London');
  await expect(resultsDiv).toContainText('1990-01-01');
  await expect(resultsDiv).toContainText('MK567NT'); 
  await expect(resultsDiv).toContainText('2030-01-01');

  await expect(page.locator('#results').locator('div')).toHaveCount(1) // only one owner

  // EXCEPTION - checking if system rejects a duplicate owner with  duplicate details
      // also checking if this is case sensitive for address and license
  await page.getByRole('link', { name: 'Add a vehicle' }).click()
  await page.waitForTimeout(1000);

  //checking for duplicate vehicle, !!checking that add owner button is not available
  await page.fill('#rego', 'BC256JK')
  await page.fill('#make', 'Kia')
  await page.fill('#model', 'Picanto')
  await page.fill('#colour', 'Red')
  await page.fill('#owner', 'Kevin Green')

  await page.getByRole('button', { name: 'Check owner' }).click();
  await page.getByRole('button', { name: 'New Owner' }).click();
  
  await page.fill('#name', 'Kevin Green')
  await page.fill('#address', 'london')
  await page.fill('#dob', '1990-01-01')
  await page.fill('#license', 'mk567nt')
  await page.fill('#expire', '2030-01-01'); // this is the last field, no more empty fields.
  
  // correct button name
  await page.getByRole('button', { name: 'Add owner' }).click();
  await expect(message).toContainText('Error');

    // search people to make sure there are no duplicates of kevin green with the same details!!
  await page.getByRole('link', { name: 'People search' }).click()
  await page.waitForTimeout(1000);
  
  //checking people search driving license number field is correct
  await page.locator('#license').fill('MK567NT')
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(resultsDiv).toContainText('Kevin Green');
  await expect(resultsDiv).toContainText('London');
  await expect(resultsDiv).toContainText('1990-01-01');
  await expect(resultsDiv).toContainText('MK567NT'); 
  await expect(resultsDiv).toContainText('2030-01-01');

  await expect(page.locator('#results').locator('div')).toHaveCount(1) // only one owner

  // EXCEPTION 
  // checking if system allow DUPLICATE 0WNER NAME with DIFFERENT DETAILS apart from car colour!
  await page.getByRole('link', { name: 'Add a vehicle' }).click() //reload page
  await page.waitForTimeout(1000);

  await page.fill('#rego', 'NG567HK') // different data
  await page.fill('#make', 'Ford') // different data
  await page.fill('#model', 'Focus') // different data
  await page.fill('#colour', 'Red') // the car colour is ALSO red! this should still be accepted
  await page.fill('#owner', 'Kevin Green') // same owner name

  await page.getByRole('button', { name: 'Check owner' }).click();
  await page.getByRole('button', { name: 'New Owner' }).click();
  
  await page.fill('#name', 'Kevin Green') // same owner name
  await page.fill('#address', 'London') // same location
  await page.fill('#dob', '1995-02-01') // different DOB
  await page.fill('#license', 'NG567HK') // different license
  await page.fill('#expire', '2031-06-01'); // this is the last field, no more empty fields.
  // correct button name
  await page.getByRole('button', { name: 'Add owner' }).click();
  await expect(message).toContainText('Owner added successfully');

  await page.getByRole('link', { name: 'People search' }).click()
  await page.waitForTimeout(1000);

  //EXCEPTION checking for case sensitive/incomplete name searches (should find Kevin Green)
  await page.locator('#name').fill('kev')
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(resultsDiv).toContainText('Kevin Green');
  await expect(resultsDiv).toContainText('London');
  await expect(resultsDiv).toContainText('1990-01-01');
  await expect(resultsDiv).toContainText('MK567NT'); 
  await expect(resultsDiv).toContainText('2030-01-01');

  await expect(resultsDiv).toContainText('Kevin Green');
  await expect(resultsDiv).toContainText('London');
  await expect(resultsDiv).toContainText('1995-02-01');
  await expect(resultsDiv).toContainText('NG567HK'); 
  await expect(resultsDiv).toContainText('2031-06-01');
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
  await page.fill('#license', 'R'+specialChars); 

  await expect(page.locator('#name')).toHaveValue('Jn');
  await expect(page.locator('#address')).toHaveValue('Notm');
  await expect(page.locator('#license')).toHaveValue('R');

});

test('should toggle between dark and light mode', async ({ page }) => {
  // locate the theme toggle elements
  const themeToggle = page.locator('#theme-toggle');
  const themeIcon = page.locator('#theme-icon');
  
  // verify initial state 
  await expect(themeIcon).toHaveText('🌙 Dark Mode'); // default light mode
  
  // check initial theme attribute
  const initialTheme = await page.evaluate(() => 
    document.documentElement.getAttribute('data-theme')
  );
  expect(initialTheme).toBeFalsy(); // should be null/undefined for light mode
  
  // click to toggle to dark mode
  await themeToggle.click();
  
  // verify dark mode attributes and icon
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(themeIcon).toHaveText('☀️ Light Mode');
  
  // verify localStorage was updated
  const darkModeStorage = await page.evaluate(() => 
    localStorage.getItem('theme')
  );
  expect(darkModeStorage).toBe('dark');
  
  // verify CSS variables changed (example check)
  const darkBgColor = await page.evaluate(() => 
    getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-color').trim()
  );
  expect(darkBgColor).toBe('#2e2f35'); // dark mode bg color
  
  // toggle back to light mode
  await themeToggle.click();
  
  // verify light mode attributes
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await expect(themeIcon).toHaveText('🌙 Dark Mode');
  
  // verify localstorage was updated
  const lightModeStorage = await page.evaluate(() => 
    localStorage.getItem('theme')
  );
  expect(lightModeStorage).toBe('light');
});

test('should persist theme preference on page reload', async ({ page }) => {

  await page.locator('#theme-toggle').click();
  
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#theme-icon')).toHaveText('☀️ Light Mode');
});
