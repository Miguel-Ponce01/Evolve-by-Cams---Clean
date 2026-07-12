# Evolve by Cams — User Acceptance Test (UAT) & Prototype Feedback Questionnaire

Welcome to the User Acceptance Testing (UAT) phase for the **Evolve by Cams** client website and POS console prototype. 

> [!NOTE]
> This application is currently in its **prototype phase**. Online payment gateways and SMS/Email dispatch systems are fully simulated in the front-end interface. You do not need to use real money, credentials, or telephone numbers to complete these tests.

---

## 📋 Part 1: User Acceptance Test (UAT) Script

Please follow these step-by-step instructions to test the core features of the system. Record whether each step passes or fails, and note any visual or functional feedback.

### Test Scenario 1: Brand & Layout Exploration
* **Objective:** Verify visual appeal, typography, color harmony, and responsiveness of the landing page.
* **Steps:**
  1. Open the application in your browser (usually [http://localhost:3000](http://localhost:3000)).
  2. Scroll through the homepage. Observe the colors (deep aubergine, warm cream-lavender, and link blue) and typography.
  3. Shrink the browser window or view the page on a mobile device to test responsiveness.
  4. Navigate to the **About**, **Instructors**, **FAQ**, and **Location** pages via the navigation menu.
* **Expected Result:**
  * Layout adjusts gracefully on all screen sizes (no overlapping text or cut-off elements).
  * Design feels premium and reflects a high-end wellness studio.

---

### Test Scenario 2: Browse Schedules & Class Details
* **Objective:** Verify navigation to classes and schedules.
* **Steps:**
  1. Click **Schedule** or **Classes** in the main navigation menu.
  2. Filter classes by category or day (if controls are present) or browse the listing.
  3. Click on a specific class to view its details, description, and available reformer count.
* **Expected Result:**
  * Schedule details and timetables load correctly.
  * Information is readable and structured logically.

---

### Test Scenario 3: Reformer Spot Selection & Waitlist
* **Objective:** Select a reformer station from the visual roster.
* **Steps:**
  1. Select a class and click **Book Now** to navigate to the Reformer map.
  2. Inspect the visual room layout representing reformer beds.
  3. Try tapping on an **occupied** spot (should show as unavailable or prompt waitlist).
  4. Tap on an **available** spot (should highlight your selection and unlock the next action).
* **Expected Result:**
  * The visual roster represents the studio layout clearly.
  * Selected seats/beds are clearly highlighted.

---

### Test Scenario 4: Smart Checkout (Simulated)
* **Objective:** Complete the booking intake and checkout form with mock details.
* **Steps:**
  1. Once a reformer spot is selected, click **Proceed to Checkout**.
  2. Input test client details (e.g., Name: `Jane Doe`, Email: `jane@example.com`, Phone: `09123456789`).
  3. Choose a payment method: **Cash**, **Card**, or **Class Credits**.
  4. Click **Complete Booking**.
* **Expected Result:**
  * The form validates inputs correctly.
  * Payment steps do not prompt for real payment details but guide you smoothly to the success page.

---

### Test Scenario 5: Success Receipt & Notification Simulator
* **Objective:** Verify that simulated receipts and notification alerts are rendered.
* **Steps:**
  1. After checkout, verify that you are redirected to the **Receipt** screen.
  2. Inspect the rendered receipt details (studio name, booking date, reformer bed number).
  3. Check the client notification logs on the screen representing simulated SMS/Email notifications (e.g., the safety guidelines, grip socks policy).
* **Expected Result:**
  * Receipt lists the correct reformer bed and class.
  * Simulated client alert shows the correct template containing the grip socks safety guideline.

---

## 📝 Part 2: Prototype Feedback Questionnaire

Please answer the following questions after completing the test scenarios above. Your input is vital to improving the final application.

### Section A: First Impressions & Aesthetics
1. **How would you rate the overall design style (color palette, typography, layout) on a scale of 1 to 5?** *(1 = Needs Work, 5 = Premium & Stunning)*
   * **Score:** `[ ]`
   * **Comments:**

2. **Does the custom Slacc-inspired brand identity (aubergine, cream, and blue accents) feel premium and suitable for a boutique fitness studio?**
   * **Answer:**

3. **Did you notice any visual elements that felt out of place, misaligned, or difficult to read?**
   * **Answer:**

---

### Section B: Usability & Navigation
4. **Was it easy to locate the class schedule and identify available reformer beds?**
   * **Answer:**

5. **Did you test the website on a mobile device or a resized window? If so, did the menus, booking map, and forms scale correctly?**
   * **Answer:**

6. **How intuitive was the visual reformer selection map?** *(e.g., Was it clear which spots were taken versus available?)*
   * **Answer:**

---

### Section C: Prototype Features & Simulators
7. **Since payments are simulated, did the checkout flow still feel realistic and easy to complete?**
   * **Answer:**

8. **Did you see the simulated SMS/Email alert panel? Was the receipt information clear and did the safety policies (like the grip socks rule) stand out?**
   * **Answer:**

---

### Section D: Overall & Bug Reports
9. **Did you encounter any technical bugs, broken links, or buttons that did not react when clicked?** *(Please detail the steps to reproduce the issue)*
   * **Answer:**

10. **What is the single most important feature or design improvement we should add before linking live backend APIs and payment systems?**
    * **Answer:**

---

Thank you for your valuable feedback! Your response helps us transition this prototype into a production-ready application.
