# Aether AI - Comprehensive Testing Scenarios

## Test Scenario 1: Balance Command
**Objective**: Test real wallet balance fetching functionality

### Test Steps:
1. Open Aether AI application (http://localhost:3000)
2. Switch to **Agent** mode
3. Type: `Balance:`
4. Press Enter and wait for response

### Expected Results:
- ✅ Should show loading message initially ("🔄 Fetching balance data...")
- ✅ Should display real wallet balance data including:
  - ALGO balance (total, available, minimum)
  - ASA holdings with token names and amounts
  - Real-time timestamp
- ❌ Should NOT show mock data like "1,234.56 ALGO" or "$2,847.32"

---

## Test Scenario 2: Contract Generation (No Fallback)
**Objective**: Verify contract generation works on first attempt without falling back to templates

### Test Steps:
1. Stay in **Agent** mode
2. Type: `Contract: voting system for community proposals`
3. Wait for AI response
4. Check console logs for retry attempts
5. Try different contract types:
   - `Contract: escrow for multi-party transactions`
   - `Contract: token management with transfer controls`

### Expected Results:
- ✅ Should generate complete TEAL v8 contract on first attempt
- ✅ Contract should include `#pragma version 8`
- ✅ Should have real functionality (not skeleton code)
- ✅ Should include detailed comments
- ❌ Should NOT show "Smart Fallback" or "Backup System" messages
- ✅ Console should show minimal retry attempts (max 2)

---

## Test Scenario 3: Agent Operations Display
**Objective**: Verify operations are always visible and positioned correctly

### Test Steps:
1. **First Prompt Test**:
   - Refresh page, select **Agent** mode
   - Check operations display BELOW the initial prompt
2. **Subsequent Prompts Test**:
   - Send first message: `Balance:`
   - Check operations display ABOVE the input box
   - Send another message: `Contract: simple voting`
   - Verify operations are still visible above input

### Expected Results:
- ✅ Operations should appear below first prompt initially
- ✅ Operations should appear above input box after first message
- ✅ Operations should NEVER disappear in Agent mode
- ✅ All 5 operations should be visible: Send, Contract, Balance, Swap, Pool

---

## Test Scenario 4: Text Overflow Prevention
**Objective**: Ensure AI responses don't overflow chat containers

### Test Steps:
1. Generate a long contract: `Contract: complex multi-signature wallet with voting, time locks, and emergency features`
2. Ask for a detailed explanation: `Explain Algorand consensus in detail`
3. Test with code blocks containing very long lines
4. Resize browser window to different widths

### Expected Results:
- ✅ All text should stay within chat containers
- ✅ Long code lines should wrap or scroll horizontally
- ✅ No horizontal overflow on page
- ✅ Text should be readable on mobile/narrow screens

---

## Test Scenario 5: Green Comment Highlighting
**Objective**: Verify comment lines are highlighted in green with "//" preserved

### Test Steps:
1. Generate contract with comments: `Contract: simple payment with detailed comments`
2. Look for lines starting with "//"
3. Check syntax highlighting in code blocks

### Expected Results:
- ✅ Lines starting with "//" should be highlighted in green
- ✅ "//" characters should be preserved (not removed)
- ✅ Comments should have italic styling
- ✅ Other syntax highlighting should work (keywords, strings, numbers)

---

## Test Scenario 6: Pool Recommendation System
**Objective**: Test AI-powered pool recommendations with different preferences

### Test Steps:
1. **Basic Pool Query**:
   - Type: `Pool:`
   - Should show preference guide

2. **Low Risk Preference**:
   - Type: `Pool: low risk, high liquidity, staking required`
   - Should recommend ALGO/USDC, ALGO/USDT

3. **High Risk Preference**:
   - Type: `Pool: high risk, high rewards`
   - Should recommend ALGO/DEFLY, ALGO/TINY

4. **Mixed Preferences**:
   - Type: `Pool: medium risk, staking, AKTA tokens`
   - Should filter accordingly

### Expected Results:
- ✅ Should provide personalized recommendations
- ✅ Should show pool details: liquidity, APR, risk level, staking options
- ✅ Should explain why each pool is recommended
- ✅ Should include real metrics (even if mock data)
- ✅ Should handle invalid/no preferences gracefully

---

## Test Scenario 7: Swap-to-Pool Integration
**Objective**: Verify swap commands suggest pool opportunities

### Test Steps:
1. Type: `Swap: 100 USDC to ALGO`
2. Check if response includes pool suggestion
3. Try: `Swap: ALGO to DEFLY`
4. Verify pool recommendations appear

### Expected Results:
- ✅ Swap quotes should include pool suggestions
- ✅ Should say something like "Want to earn from this pair? Try Pool: USDC/ALGO"
- ✅ Should maintain normal swap functionality
- ✅ Pool suggestions should be relevant to the swap pair

---

## Test Scenario 8: Error Handling & Resilience
**Objective**: Test system behavior under error conditions

### Test Steps:
1. **Network Errors**:
   - Disconnect internet
   - Try balance command
   - Try pool recommendations

2. **Invalid Inputs**:
   - Type: `Contract:` (empty)
   - Type: `Pool: invalid preference xyz`
   - Type: `Balance:` with no wallet connected

3. **API Failures**:
   - Stop backend server
   - Test various commands

### Expected Results:
- ✅ Should show user-friendly error messages
- ✅ Should not crash the application
- ✅ Should provide guidance on how to resolve issues
- ✅ Should gracefully handle missing wallet connections

---

## Test Scenario 9: End-to-End Agent Workflow
**Objective**: Test complete user journey through multiple operations

### Test Steps:
1. Start in Agent mode
2. Check balance: `Balance:`
3. Get pool recommendations: `Pool: low risk, staking`
4. Check swap rates: `Swap: 50 ALGO to USDC`
5. Generate contract: `Contract: payment splitter`
6. Refine contract: `Contract: add time delays`

### Expected Results:
- ✅ All operations should work seamlessly together
- ✅ Operations should remain visible throughout
- ✅ Context should be preserved between commands
- ✅ No memory leaks or performance degradation

---

## Test Scenario 10: UI/UX Validation
**Objective**: Verify user interface behaves correctly

### Test Steps:
1. **Mode Switching**: Test Ask vs Agent modes
2. **Responsive Design**: Test on different screen sizes
3. **Loading States**: Verify loading indicators work
4. **Button Interactions**: Test all operation buttons
5. **Input Validation**: Test various input formats

### Expected Results:
- ✅ Smooth transitions between modes
- ✅ Responsive on mobile and desktop
- ✅ Clear loading indicators
- ✅ Buttons should provide appropriate feedback
- ✅ Input should handle edge cases gracefully

---

## Performance Benchmarks
- Balance fetch: < 3 seconds
- Pool recommendations: < 2 seconds  
- Contract generation: < 10 seconds
- Page load time: < 2 seconds
- Memory usage: < 100MB after 1 hour of use

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Success Criteria
- All 10 test scenarios pass
- No console errors during normal operation
- Performance benchmarks met
- Cross-browser compatibility confirmed
- Mobile responsive design working

---

*Run these tests after each deployment to ensure system reliability.*
