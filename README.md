# Approvals — Varicon Prototype

Generated from a Varicon discovery session.

## What this demonstrates
The prototype should focus on the highest priority item confirmed in next steps: the three-phase bill approval visibility redesign. It should display a bill list view with updated approval status labels that clearly distinguish between 'Awaiting Approval', 'Partially Approved - Awaiting Approver 2', 'Partially Approved - Awaiting Final Approval', and 'Fully Approved'. A detail view or status indicator should show which specific approver has approved and whose action is pending. The approval filter panel should be redesigned to correctly filter bills by individual approver at any stage of the workflow. A secondary component should mock up the Day Works docket notes feature, showing an internal notes or audit log panel on a submitted docket where users can add timestamped notes visible to the team but not printed on the docket. Optionally, a charge rate management screen should be wireframed to show a table of Day Works charge rates that users can view, upload via spreadsheet, and amend directly in Varicon.

## Features shown
- Additional approval status (e.g. 'Final Approval') to clearly indicate which phase of the three-phase approval a bill is in and who needs to act next
- Fixed approval filter that correctly returns bills filtered by a specific approver when multiple approvers are assigned
- Ability to directly adjust the GST figure on a bill independently of the subtotal to match the physical invoice
- Reliable and automatic bill syncing to Xero without requiring manual intervention or causing frequency errors
- Ability to add internal notes or audit log entries to a submitted Day Works docket without the note appearing on the docket itself
- User-facing interface to view, upload, and amend Day Works charge rates directly within Varicon
- WBS copy/duplicate functionality so that the WBS assignment can be copied across all lines of a bill and selectively amended
- In-app approval visibility notifications as an alternative or supplement to email notifications
- Lost time tracking and reporting for stand-down hours within Day Works

## Running locally
```
npm install
npm run dev
```

## Note
This is a prototype with mock data. No real API calls are made.
